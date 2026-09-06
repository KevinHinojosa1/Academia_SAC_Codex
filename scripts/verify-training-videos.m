#import <AppKit/AppKit.h>
#import <AVFoundation/AVFoundation.h>

static NSString *SACFourCC(OSType code) {
  char value[5] = {
    (char)((code >> 24) & 0xff),
    (char)((code >> 16) & 0xff),
    (char)((code >> 8) & 0xff),
    (char)(code & 0xff),
    0
  };
  return [NSString stringWithCString:value encoding:NSMacOSRomanStringEncoding];
}

int main(void) {
  @autoreleasepool {
    NSString *root = NSFileManager.defaultManager.currentDirectoryPath;
    NSArray<NSString *> *names = @[
      @"microclase-recepcion-segura.mp4",
      @"microclase-detectar-riesgos.mp4",
      @"microclase-conversacion-cliente.mp4"
    ];
    BOOL valid = YES;

    for (NSString *name in names) {
      NSString *path = [root stringByAppendingPathComponent:[@"public/media" stringByAppendingPathComponent:name]];
      AVURLAsset *asset = [AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:path] options:nil];
      AVAssetTrack *track = [[asset tracksWithMediaType:AVMediaTypeVideo] firstObject];
      Float64 seconds = CMTimeGetSeconds(asset.duration);
      CGSize transformed = CGSizeApplyAffineTransform(track.naturalSize, track.preferredTransform);
      NSInteger width = (NSInteger)llround(fabs(transformed.width));
      NSInteger height = (NSInteger)llround(fabs(transformed.height));
      OSType subtype = 0;
      if (track.formatDescriptions.count > 0) {
        CMFormatDescriptionRef description = (__bridge CMFormatDescriptionRef)track.formatDescriptions.firstObject;
        subtype = CMFormatDescriptionGetMediaSubType(description);
      }
      BOOL itemValid = track != nil && fabs(seconds - 18.0) < 0.1 && width == 1280 && height == 720 && subtype == 'avc1';
      valid = valid && itemValid;
      printf("%s | duration=%.2fs | size=%ldx%ld | codec=%s | %s\n",
             name.UTF8String, seconds, (long)width, (long)height,
             SACFourCC(subtype).UTF8String, itemValid ? "OK" : "FAIL");
    }

    NSString *previewSource = [root stringByAppendingPathComponent:@"public/media/microclase-recepcion-segura.mp4"];
    AVURLAsset *previewAsset = [AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:previewSource] options:nil];
    AVAssetImageGenerator *generator = [[AVAssetImageGenerator alloc] initWithAsset:previewAsset];
    generator.appliesPreferredTrackTransform = YES;
    NSError *previewError = nil;
    CGImageRef previewImage = [generator copyCGImageAtTime:CMTimeMakeWithSeconds(2.0, 600)
                                                actualTime:NULL
                                                     error:&previewError];
    if (previewImage) {
      NSBitmapImageRep *bitmap = [[NSBitmapImageRep alloc] initWithCGImage:previewImage];
      NSData *png = [bitmap representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
      [png writeToFile:@"/tmp/sac-video-preview.png" atomically:YES];
      CGImageRelease(previewImage);
      printf("preview=/tmp/sac-video-preview.png\n");
    } else {
      fprintf(stderr, "No se pudo extraer la vista previa: %s\n", previewError.localizedDescription.UTF8String);
      valid = NO;
    }

    return valid ? 0 : 1;
  }
}
