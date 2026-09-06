#import <AppKit/AppKit.h>
#import <AVFoundation/AVFoundation.h>
#import <CoreVideo/CoreVideo.h>

static const NSInteger SACWidth = 1280;
static const NSInteger SACHeight = 720;
static const int32_t SACFPS = 20;
static const NSTimeInterval SACChapterDuration = 4.5;

static NSDictionary *SACChapter(NSString *title, NSString *body) {
  return @{ @"title": title, @"body": body };
}

static NSArray<NSDictionary *> *SACVideoSpecs(NSString *projectPath) {
  NSString *(^path)(NSString *) = ^NSString *(NSString *relativePath) {
    return [projectPath stringByAppendingPathComponent:relativePath];
  };

  return @[
    @{
      @"image": path(@"public/media/sac-hero-recepcion.png"),
      @"output": path(@"public/media/microclase-recepcion-segura.mp4"),
      @"label": @"MICROCLASE 01  ·  RECEPCIÓN SEGURA",
      @"chapters": @[
        SACChapter(@"Primero, observe", @"Revise el armazón con buena luz y sin iniciar todavía ninguna manipulación."),
        SACChapter(@"Muestre lo que encuentra", @"Señale cada novedad al cliente con claridad y un trato respetuoso."),
        SACChapter(@"Documente el estado", @"Registre vistas frontal y laterales. Añada un acercamiento cuando exista una novedad."),
        SACChapter(@"Confirme antes de continuar", @"Explique el proceso, responda preguntas y obtenga la aceptación informada.")
      ]
    },
    @{
      @"image": path(@"public/media/sac-inspeccion-fisura.png"),
      @"output": path(@"public/media/microclase-detectar-riesgos.mp4"),
      @"label": @"MICROCLASE 02  ·  DETECCIÓN DE RIESGOS",
      @"chapters": @[
        SACChapter(@"Inspeccione puntos críticos", @"Observe puente, aros, bisagras, varillas, terminales y reparaciones previas."),
        SACChapter(@"Una fisura cambia la decisión", @"No minimice una grieta aunque parezca pequeña: puede avanzar durante el proceso."),
        SACChapter(@"Registre en contexto", @"Tome un acercamiento y una fotografía amplia que permita ubicar la novedad."),
        SACChapter(@"Riesgo alto: detenga y escale", @"La firma no reemplaza la validación del responsable ni la trazabilidad del caso.")
      ]
    },
    @{
      @"image": path(@"public/media/sac-conversacion-cliente.png"),
      @"output": path(@"public/media/microclase-conversacion-cliente.mp4"),
      @"label": @"MICROCLASE 03  ·  CONVERSACIÓN CON EL CLIENTE",
      @"chapters": @[
        SACChapter(@"Escuche antes de responder", @"Reconozca la inquietud del cliente sin interrumpir ni discutir."),
        SACChapter(@"Explique sin prometer", @"Describa el proceso y sus riesgos posibles con palabras sencillas y precisas."),
        SACChapter(@"Use una frase profesional", @"“Permítame mostrarle lo que observamos y explicarle cómo vamos a proceder”."),
        SACChapter(@"Cierre con un siguiente paso", @"Confirme que no quedan dudas y deje registrado lo acordado.")
      ]
    }
  ];
}

static NSColor *SACColor(CGFloat red, CGFloat green, CGFloat blue, CGFloat alpha) {
  return [NSColor colorWithCalibratedRed:red green:green blue:blue alpha:alpha];
}

static void SACDrawText(NSString *text, NSRect rect, NSFont *font, NSColor *color,
                        NSTextAlignment alignment, CGFloat lineHeight) {
  NSMutableParagraphStyle *paragraph = [[NSMutableParagraphStyle alloc] init];
  paragraph.alignment = alignment;
  paragraph.lineBreakMode = NSLineBreakByWordWrapping;
  if (lineHeight > 0) {
    paragraph.minimumLineHeight = lineHeight;
    paragraph.maximumLineHeight = lineHeight;
  }
  [text drawInRect:rect withAttributes:@{
    NSFontAttributeName: font,
    NSForegroundColorAttributeName: color,
    NSParagraphStyleAttributeName: paragraph
  }];
}

static void SACDrawCoverImage(NSImage *image, NSRect canvas, CGFloat progress) {
  NSSize source = image.size;
  CGFloat canvasRatio = canvas.size.width / canvas.size.height;
  CGFloat imageRatio = source.width / source.height;
  CGFloat width = 0;
  CGFloat height = 0;
  if (imageRatio > canvasRatio) {
    height = canvas.size.height;
    width = height * imageRatio;
  } else {
    width = canvas.size.width;
    height = width / imageRatio;
  }

  CGFloat zoom = 1.035 + progress * 0.055;
  width *= zoom;
  height *= zoom;
  CGFloat horizontalTravel = MAX(0, width - canvas.size.width);
  CGFloat x = -horizontalTravel * (0.18 + progress * 0.62);
  CGFloat y = (canvas.size.height - height) / 2.0;
  [image drawInRect:NSMakeRect(x, y, width, height)
           fromRect:NSZeroRect
          operation:NSCompositingOperationSourceOver
           fraction:1.0
     respectFlipped:YES
              hints:@{NSImageHintInterpolation: @(NSImageInterpolationHigh)}];
}

static void SACRenderFrame(CGContextRef context, NSImage *image, NSDictionary *spec,
                           NSInteger frame, NSInteger totalFrames) {
  CGFloat progress = totalFrames > 1 ? (CGFloat)frame / (CGFloat)(totalFrames - 1) : 0;
  NSGraphicsContext *graphics = [NSGraphicsContext graphicsContextWithCGContext:context flipped:YES];
  [NSGraphicsContext saveGraphicsState];
  [NSGraphicsContext setCurrentContext:graphics];

  [SACColor(0.02, 0.055, 0.09, 1) setFill];
  NSRectFill(NSMakeRect(0, 0, SACWidth, SACHeight));
  SACDrawCoverImage(image, NSMakeRect(0, 0, SACWidth, SACHeight), progress);

  NSGradient *veil = [[NSGradient alloc] initWithColorsAndLocations:
    SACColor(0.01, 0.035, 0.06, 0.12), 0.0,
    SACColor(0.01, 0.035, 0.06, 0.25), 0.45,
    SACColor(0.01, 0.035, 0.06, 0.94), 1.0,
    nil];
  [veil drawInRect:NSMakeRect(0, 0, SACWidth, SACHeight) angle:-90];

  [SACColor(0.018, 0.07, 0.11, 0.78) setFill];
  NSRectFill(NSMakeRect(0, 0, SACWidth, 82));
  SACDrawText(@"SAC", NSMakeRect(60, 22, 108, 45),
              [NSFont systemFontOfSize:32 weight:NSFontWeightHeavy], NSColor.whiteColor,
              NSTextAlignmentLeft, 0);
  SACDrawText(spec[@"label"], NSMakeRect(166, 31, 760, 32),
              [NSFont systemFontOfSize:15 weight:NSFontWeightSemibold],
              SACColor(0.45, 0.94, 0.85, 1), NSTextAlignmentLeft, 0);

  NSArray *chapters = spec[@"chapters"];
  NSInteger chapterIndex = MIN((NSInteger)chapters.count - 1,
                               (NSInteger)floor((double)frame / ((double)SACFPS * SACChapterDuration)));
  NSDictionary *chapter = chapters[chapterIndex];
  double firstFrame = (double)chapterIndex * (double)SACFPS * SACChapterDuration;
  double chapterFrame = (double)frame - firstFrame;
  double fadeFrames = (double)SACFPS * 0.35;
  double chapterFrames = (double)SACFPS * SACChapterDuration;
  CGFloat fadeIn = (CGFloat)MIN(1.0, MAX(0.0, chapterFrame / fadeFrames));
  CGFloat fadeOut = (CGFloat)MIN(1.0, MAX(0.0, (chapterFrames - chapterFrame) / fadeFrames));
  CGFloat alpha = MIN(fadeIn, fadeOut);

  NSRect card = NSMakeRect(58, 418, 954, 244);
  NSBezierPath *cardPath = [NSBezierPath bezierPathWithRoundedRect:card xRadius:26 yRadius:26];
  [SACColor(0.008, 0.04, 0.07, 0.90 * alpha) setFill];
  [cardPath fill];
  [SACColor(0.45, 0.94, 0.85, 0.7 * alpha) setStroke];
  cardPath.lineWidth = 1.0;
  [cardPath stroke];

  SACDrawText([NSString stringWithFormat:@"%02ld", (long)chapterIndex + 1],
              NSMakeRect(90, 447, 80, 30),
              [NSFont monospacedDigitSystemFontOfSize:19 weight:NSFontWeightBold],
              SACColor(0.30, 0.93, 0.82, alpha), NSTextAlignmentLeft, 0);
  SACDrawText(chapter[@"title"], NSMakeRect(90, 482, 850, 58),
              [NSFont systemFontOfSize:41 weight:NSFontWeightBold],
              [NSColor colorWithWhite:1 alpha:alpha], NSTextAlignmentLeft, 0);
  SACDrawText(chapter[@"body"], NSMakeRect(91, 548, 842, 78),
              [NSFont systemFontOfSize:22 weight:NSFontWeightMedium],
              [NSColor colorWithWhite:0.92 alpha:alpha], NSTextAlignmentLeft, 30);

  [SACColor(1, 1, 1, 0.25) setFill];
  NSRectFill(NSMakeRect(58, 693, 1164, 5));
  [SACColor(0.20, 0.88, 0.77, 1) setFill];
  NSRectFill(NSMakeRect(58, 693, 1164 * progress, 5));

  [NSGraphicsContext restoreGraphicsState];
}

// AVAssetWriter interpreta la primera fila del búfer como la parte superior del
// fotograma; AppKit la dibuja en el sentido opuesto dentro de este bitmap. El
// intercambio se hace sobre el raster final para conservar texto e imagen nítidos.
static void SACFlipPixelRows(CVPixelBufferRef pixelBuffer) {
  uint8_t *base = CVPixelBufferGetBaseAddress(pixelBuffer);
  size_t bytesPerRow = CVPixelBufferGetBytesPerRow(pixelBuffer);
  size_t height = CVPixelBufferGetHeight(pixelBuffer);
  uint8_t *temporary = malloc(bytesPerRow);
  if (!temporary) return;
  for (size_t row = 0; row < height / 2; row++) {
    uint8_t *top = base + row * bytesPerRow;
    uint8_t *bottom = base + (height - 1 - row) * bytesPerRow;
    memcpy(temporary, top, bytesPerRow);
    memcpy(top, bottom, bytesPerRow);
    memcpy(bottom, temporary, bytesPerRow);
  }
  free(temporary);
}

static BOOL SACBuildVideo(NSDictionary *spec, NSError **error) {
  NSImage *image = [[NSImage alloc] initWithContentsOfFile:spec[@"image"]];
  if (!image) {
    if (error) {
      *error = [NSError errorWithDomain:@"SACVideo" code:1 userInfo:@{
        NSLocalizedDescriptionKey: [NSString stringWithFormat:@"No se pudo abrir %@", spec[@"image"]]
      }];
    }
    return NO;
  }

  NSURL *outputURL = [NSURL fileURLWithPath:spec[@"output"]];
  [[NSFileManager defaultManager] removeItemAtURL:outputURL error:nil];
  AVAssetWriter *writer = [[AVAssetWriter alloc] initWithURL:outputURL
                                                   fileType:AVFileTypeMPEG4
                                                      error:error];
  if (!writer) return NO;
  writer.shouldOptimizeForNetworkUse = YES;

  NSDictionary *compression = @{
    AVVideoAverageBitRateKey: @3500000,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    AVVideoMaxKeyFrameIntervalKey: @(SACFPS * 2)
  };
  NSDictionary *settings = @{
    AVVideoCodecKey: AVVideoCodecTypeH264,
    AVVideoWidthKey: @(SACWidth),
    AVVideoHeightKey: @(SACHeight),
    AVVideoCompressionPropertiesKey: compression
  };
  AVAssetWriterInput *input = [[AVAssetWriterInput alloc] initWithMediaType:AVMediaTypeVideo
                                                              outputSettings:settings];
  input.expectsMediaDataInRealTime = NO;
  NSDictionary *attributes = @{
    (NSString *)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32BGRA),
    (NSString *)kCVPixelBufferWidthKey: @(SACWidth),
    (NSString *)kCVPixelBufferHeightKey: @(SACHeight),
    (NSString *)kCVPixelBufferCGBitmapContextCompatibilityKey: @YES
  };
  AVAssetWriterInputPixelBufferAdaptor *adaptor =
    [[AVAssetWriterInputPixelBufferAdaptor alloc] initWithAssetWriterInput:input
                                               sourcePixelBufferAttributes:attributes];
  if (![writer canAddInput:input]) {
    if (error) *error = [NSError errorWithDomain:@"SACVideo" code:2 userInfo:@{NSLocalizedDescriptionKey: @"No se pudo añadir la pista de video."}];
    return NO;
  }
  [writer addInput:input];
  if (![writer startWriting]) {
    if (error) *error = writer.error;
    return NO;
  }
  [writer startSessionAtSourceTime:kCMTimeZero];

  NSInteger totalFrames = (NSInteger)llround(4.0 * SACChapterDuration * SACFPS);
  for (NSInteger frame = 0; frame < totalFrames; frame++) {
    @autoreleasepool {
      while (!input.readyForMoreMediaData) {
        [NSThread sleepForTimeInterval:0.002];
      }
      CVPixelBufferRef pixelBuffer = NULL;
      CVReturn result = CVPixelBufferPoolCreatePixelBuffer(NULL, adaptor.pixelBufferPool, &pixelBuffer);
      if (result != kCVReturnSuccess || pixelBuffer == NULL) {
        if (error) *error = [NSError errorWithDomain:@"SACVideo" code:3 userInfo:@{NSLocalizedDescriptionKey: @"No se pudo crear un fotograma."}];
        [writer cancelWriting];
        return NO;
      }

      CVPixelBufferLockBaseAddress(pixelBuffer, 0);
      CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
      CGContextRef context = CGBitmapContextCreate(CVPixelBufferGetBaseAddress(pixelBuffer),
                                                   SACWidth, SACHeight, 8,
                                                   CVPixelBufferGetBytesPerRow(pixelBuffer),
                                                   colorSpace,
                                                   kCGBitmapByteOrder32Little | kCGImageAlphaPremultipliedFirst);
      CGColorSpaceRelease(colorSpace);
      if (!context) {
        CVPixelBufferUnlockBaseAddress(pixelBuffer, 0);
        CVPixelBufferRelease(pixelBuffer);
        if (error) *error = [NSError errorWithDomain:@"SACVideo" code:4 userInfo:@{NSLocalizedDescriptionKey: @"No se pudo dibujar un fotograma."}];
        [writer cancelWriting];
        return NO;
      }
      SACRenderFrame(context, image, spec, frame, totalFrames);
      CGContextRelease(context);
      SACFlipPixelRows(pixelBuffer);
      CVPixelBufferUnlockBaseAddress(pixelBuffer, 0);

      CMTime presentationTime = CMTimeMake(frame, SACFPS);
      BOOL appended = [adaptor appendPixelBuffer:pixelBuffer withPresentationTime:presentationTime];
      CVPixelBufferRelease(pixelBuffer);
      if (!appended) {
        if (error) *error = writer.error ?: [NSError errorWithDomain:@"SACVideo" code:5 userInfo:@{NSLocalizedDescriptionKey: @"No se pudo codificar un fotograma."}];
        [writer cancelWriting];
        return NO;
      }
    }
  }

  [input markAsFinished];
  dispatch_semaphore_t completion = dispatch_semaphore_create(0);
  [writer finishWritingWithCompletionHandler:^{ dispatch_semaphore_signal(completion); }];
  dispatch_semaphore_wait(completion, DISPATCH_TIME_FOREVER);
  if (writer.status != AVAssetWriterStatusCompleted) {
    if (error) *error = writer.error ?: [NSError errorWithDomain:@"SACVideo" code:6 userInfo:@{NSLocalizedDescriptionKey: @"La escritura del video no terminó correctamente."}];
    return NO;
  }

  printf("Creado: %s\n", [spec[@"output"] fileSystemRepresentation]);
  return YES;
}

int main(void) {
  @autoreleasepool {
    NSString *projectPath = [[NSFileManager defaultManager] currentDirectoryPath];
    for (NSDictionary *spec in SACVideoSpecs(projectPath)) {
      NSError *error = nil;
      if (!SACBuildVideo(spec, &error)) {
        fprintf(stderr, "Error %s/%ld: %s\n", error.domain.UTF8String, (long)error.code,
                error.localizedDescription.UTF8String);
        return 1;
      }
    }
  }
  return 0;
}
