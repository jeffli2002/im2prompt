import vision from '@google-cloud/vision';

let client: InstanceType<typeof vision.ImageAnnotatorClient> | null = null;

function getClient() {
  if (!client) {
    const credsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!credsEnv) {
      console.warn('[Google Vision] GOOGLE_APPLICATION_CREDENTIALS not configured - Vision API disabled');
      return null;
    }
    
    console.log('[Google Vision] Attempting to initialize client...');
    console.log('[Google Vision] Credentials env var length:', credsEnv.length);
    
    try {
      const credentials = JSON.parse(credsEnv);
      console.log('[Google Vision] JSON parse successful');
      console.log('[Google Vision] Project ID:', credentials.project_id);
      console.log('[Google Vision] Client email:', credentials.client_email);
      console.log('[Google Vision] Has private_key:', !!credentials.private_key);
      
      client = new vision.ImageAnnotatorClient({
        credentials,
      });
      
      console.log('[Google Vision] ✅ Client initialized successfully');
    } catch (error) {
      console.error('[Google Vision] ❌ Failed to initialize client:', error);
      console.error('[Google Vision] Error details:', error instanceof Error ? error.message : 'Unknown error');
      if (error instanceof Error && error.stack) {
        console.error('[Google Vision] Stack trace:', error.stack);
      }
      console.error('[Google Vision] Vision API will be disabled for this session');
      return null;
    }
  }
  return client;
}

export async function analyzeImage(imageBuffer: Buffer) {
  try {
    const visionClient = getClient();
    if (!visionClient) {
      return {
        success: false,
        error: 'Vision API client not initialized',
      };
    }
    const [result] = await visionClient.labelDetection(imageBuffer);
    const labels = result.labelAnnotations || [];
    
    return {
      success: true,
      labels: labels.map((label) => ({
        description: label.description,
        score: label.score,
      })),
    };
  } catch (error) {
    console.error('Vision API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function detectText(imageBuffer: Buffer) {
  try {
    const visionClient = getClient();
    if (!visionClient) {
      return {
        success: false,
        error: 'Vision API client not initialized',
      };
    }
    const [result] = await visionClient.textDetection(imageBuffer);
    const detections = result.textAnnotations || [];
    
    return {
      success: true,
      text: detections[0]?.description || '',
      detections: detections.slice(1).map((detection) => ({
        text: detection.description,
        confidence: detection.confidence,
      })),
    };
  } catch (error) {
    console.error('Vision API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function detectFaces(imageBuffer: Buffer) {
  try {
    const visionClient = getClient();
    if (!visionClient) {
      return {
        success: false,
        error: 'Vision API client not initialized',
      };
    }
    const [result] = await visionClient.faceDetection(imageBuffer);
    const faces = result.faceAnnotations || [];
    
    return {
      success: true,
      faces: faces.map((face) => ({
        joyLikelihood: face.joyLikelihood,
        sorrowLikelihood: face.sorrowLikelihood,
        angerLikelihood: face.angerLikelihood,
        surpriseLikelihood: face.surpriseLikelihood,
        confidence: face.detectionConfidence,
      })),
    };
  } catch (error) {
    console.error('Vision API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkForPeopleAndFaces(imageBuffer: Buffer) {
  try {
    const visionClient = getClient();
    
    // If client is null (API not configured), return success but don't block
    if (!visionClient) {
      console.warn('Vision API client not available - skipping face detection');
      return {
        success: false,
        blocked: false,
        error: 'Vision API not configured',
        reason: 'Face detection unavailable',
      };
    }
    
    const [result] = await visionClient.annotateImage({
      image: { content: imageBuffer },
      features: [
        { type: 'FACE_DETECTION' },
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'LABEL_DETECTION' },
      ],
    });
    
    const faces = result.faceAnnotations || [];
    const objects = result.localizedObjectAnnotations || [];
    const labels = result.labelAnnotations || [];
    
    const hasFaces = faces.length > 0;
    
    const personObjects = objects.filter(
      (obj) => obj.name?.toLowerCase() === 'person'
    );
    const hasPeople = personObjects.length > 0;
    
    const personLabels = labels.filter(
      (label) => 
        label.description?.toLowerCase().includes('person') ||
        label.description?.toLowerCase().includes('people') ||
        label.description?.toLowerCase().includes('human') ||
        label.description?.toLowerCase().includes('man') ||
        label.description?.toLowerCase().includes('woman') ||
        label.description?.toLowerCase().includes('child')
    );
    const hasPersonLabels = personLabels.length > 0;
    
    const blocked = hasFaces || hasPeople;
    
    // Generate bilingual error message
    let reason = null;
    if (blocked) {
      if (hasFaces) {
        reason = `检测到 ${faces.length} 个人脸 / Detected ${faces.length} face(s). Sora 2 不支持包含人物或人脸的图片 / Sora 2 does not support images with people or faces.`;
      } else {
        reason = `检测到 ${personObjects.length} 个人物 / Detected ${personObjects.length} person(s). Sora 2 不支持包含人物的图片 / Sora 2 does not support images with people.`;
      }
    }
    
    return {
      success: true,
      blocked,
      hasFaces,
      faceCount: faces.length,
      hasPeople,
      peopleCount: personObjects.length,
      hasPersonLabels,
      reason,
      details: {
        faces: faces.length,
        peopleObjects: personObjects.length,
        personLabels: personLabels.map(l => ({
          description: l.description,
          confidence: l.score,
        })),
      },
    };
  } catch (error) {
    console.error('Vision API error:', error);
    // Return success: false but blocked: false
    // This allows the request to continue even if Vision API is unavailable
    return {
      success: false,
      blocked: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      reason: error instanceof Error ? error.message : 'Vision API unavailable',
    };
  }
}

export async function analyzeImageFull(imageBuffer: Buffer) {
  try {
    const visionClient = getClient();
    if (!visionClient) {
      return {
        success: false,
        error: 'Vision API client not initialized',
      };
    }
    const [result] = await visionClient.annotateImage({
      image: { content: imageBuffer },
      features: [
        { type: 'LABEL_DETECTION' },
        { type: 'TEXT_DETECTION' },
        { type: 'FACE_DETECTION' },
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'IMAGE_PROPERTIES' },
      ],
    });
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Vision API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

type SupportedLanguage = 'en' | 'zh' | 'fr' | 'ja' | 'es';

export async function generatePromptFromImage(imageBuffer: Buffer, language: SupportedLanguage = 'en', modelStyle: string = 'general') {
  try {
    const visionClient = getClient();
    if (!visionClient) {
      return {
        success: false,
        error: 'Vision API client not initialized',
        prompt: '',
      };
    }
    const [result] = await visionClient.annotateImage({
      image: { content: imageBuffer },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 20 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
        { type: 'IMAGE_PROPERTIES' },
        { type: 'FACE_DETECTION', maxResults: 5 },
        { type: 'LANDMARK_DETECTION' },
        { type: 'TEXT_DETECTION' },
      ],
    });
    
    const labels = result.labelAnnotations || [];
    const objects = result.localizedObjectAnnotations || [];
    const colors = result.imagePropertiesAnnotation?.dominantColors?.colors || [];
    const faces = result.faceAnnotations || [];
    const texts = result.textAnnotations || [];
    
    const topLabels = labels.slice(0, 15).map(l => l.description || '');
    const topObjects = objects.slice(0, 8).map(o => o.name || '');
    const dominantColors = colors.slice(0, 3);
    
    const isNature = topLabels.some(l => 
      l.toLowerCase().includes('nature') || l.toLowerCase().includes('landscape') || 
      l.toLowerCase().includes('sky') || l.toLowerCase().includes('mountain') || 
      l.toLowerCase().includes('tree') || l.toLowerCase().includes('water')
    );
    
    const isUrban = topLabels.some(l => 
      l.toLowerCase().includes('building') || l.toLowerCase().includes('city') || 
      l.toLowerCase().includes('street') || l.toLowerCase().includes('architecture')
    );
    
    const isIndoor = topLabels.some(l => 
      l.toLowerCase().includes('room') || l.toLowerCase().includes('indoor') || 
      l.toLowerCase().includes('furniture') || l.toLowerCase().includes('interior')
    );
    
    const translations = {
      scene: {
        en: 'scene',
        zh: '场景',
        fr: 'scène',
        ja: 'シーン',
        es: 'escena'
      },
      naturalLandscape: {
        en: 'natural landscape setting',
        zh: '自然风光场景',
        fr: 'paysage naturel',
        ja: '自然風景',
        es: 'paisaje natural'
      },
      urbanEnvironment: {
        en: 'urban environment',
        zh: '城市环境',
        fr: 'environnement urbain',
        ja: '都市環境',
        es: 'entorno urbano'
      },
      indoorSpace: {
        en: 'indoor space',
        zh: '室内空间',
        fr: 'espace intérieur',
        ja: '室内空間',
        es: 'espacio interior'
      },
      openScene: {
        en: 'open scene',
        zh: '开放场景',
        fr: 'scène ouverte',
        ja: 'オープンシーン',
        es: 'escena abierta'
      }
    };
    
    const mainSubject = topObjects[0] || topLabels[0] || translations.scene[language];
    const secondaryObjects = topObjects.slice(1, 4).join(language === 'zh' || language === 'ja' ? '、' : ', ');
    
    let environment = '';
    if (isNature) {
      environment = translations.naturalLandscape[language];
    } else if (isUrban) {
      environment = translations.urbanEnvironment[language];
    } else if (isIndoor) {
      environment = translations.indoorSpace[language];
    } else {
      environment = translations.openScene[language];
    }
    
    const lightingTranslations = {
      bright: {
        en: 'bright natural light',
        zh: '明亮的自然光',
        fr: 'lumière naturelle vive',
        ja: '明るい自然光',
        es: 'luz natural brillante'
      },
      soft: {
        en: 'soft lighting',
        zh: '柔和的光线',
        fr: 'éclairage doux',
        ja: '柔らかい照明',
        es: 'iluminación suave'
      },
      moody: {
        en: 'moody lighting',
        zh: '低调的照明',
        fr: 'éclairage atmosphérique',
        ja: 'ムーディな照明',
        es: 'iluminación atmosférica'
      },
      daytime: {
        en: 'daytime',
        zh: '白天',
        fr: 'jour',
        ja: '昼間',
        es: 'día'
      },
      goldenHour: {
        en: 'golden hour',
        zh: '黄金时段',
        fr: 'heure dorée',
        ja: 'ゴールデンアワー',
        es: 'hora dorada'
      },
      evening: {
        en: 'evening or night',
        zh: '傍晚或夜晚',
        fr: 'soir ou nuit',
        ja: '夕方または夜',
        es: 'tarde o noche'
      }
    };
    
    const moodTranslations = {
      joyful: {
        en: 'joyful and vibrant',
        zh: '欢快愉悦',
        fr: 'joyeux et vibrant',
        ja: '楽しく活気のある',
        es: 'alegre y vibrante'
      },
      calm: {
        en: 'calm and peaceful',
        zh: '平静祥和',
        fr: 'calme et paisible',
        ja: '穏やかで平和',
        es: 'tranquilo y pacífico'
      },
      modern: {
        en: 'modern and energetic',
        zh: '现代活力',
        fr: 'moderne et énergique',
        ja: 'モダンでエネルギッシュ',
        es: 'moderno y enérgico'
      },
      professional: {
        en: 'professional and refined',
        zh: '专业精致',
        fr: 'professionnel et raffiné',
        ja: 'プロフェッショナルで洗練された',
        es: 'profesional y refinado'
      }
    };
    
    let lighting = '';
    let timeOfDay = '';
    const avgBrightness = dominantColors.reduce((sum, c) => {
      const r = c.color?.red || 0;
      const g = c.color?.green || 0;
      const b = c.color?.blue || 0;
      return sum + ((r + g + b) / 3);
    }, 0) / dominantColors.length;
    
    if (avgBrightness > 180) {
      lighting = lightingTranslations.bright[language];
      timeOfDay = lightingTranslations.daytime[language];
    } else if (avgBrightness > 100) {
      lighting = lightingTranslations.soft[language];
      timeOfDay = lightingTranslations.goldenHour[language];
    } else {
      lighting = lightingTranslations.moody[language];
      timeOfDay = lightingTranslations.evening[language];
    }
    
    let mood = '';
    if (faces.length > 0 && faces[0]?.joyLikelihood && 
        ['LIKELY', 'VERY_LIKELY'].includes(String(faces[0].joyLikelihood))) {
      mood = moodTranslations.joyful[language];
    } else if (isNature) {
      mood = moodTranslations.calm[language];
    } else if (isUrban) {
      mood = moodTranslations.modern[language];
    } else {
      mood = moodTranslations.professional[language];
    }
    
    const colorTranslations = {
      bright: {
        en: 'bright tones',
        zh: '明亮色调',
        fr: 'tons clairs',
        ja: '明るいトーン',
        es: 'tonos brillantes'
      },
      dark: {
        en: 'dark tones',
        zh: '深色调',
        fr: 'tons sombres',
        ja: '暗いトーン',
        es: 'tonos oscuros'
      },
      warm: {
        en: 'warm colors',
        zh: '暖色系',
        fr: 'couleurs chaudes',
        ja: '暖色',
        es: 'colores cálidos'
      },
      cool: {
        en: 'cool colors',
        zh: '冷色系',
        fr: 'couleurs froides',
        ja: '寒色',
        es: 'colores fríos'
      },
      neutral: {
        en: 'neutral tones',
        zh: '中性色调',
        fr: 'tons neutres',
        ja: 'ニュートラルトーン',
        es: 'tonos neutros'
      }
    };
    
    const styleTranslations = {
      en: 'cinematic photography style',
      zh: '电影摄影风格',
      fr: 'style photographique cinématographique',
      ja: 'シネマティック写真スタイル',
      es: 'estilo fotográfico cinematográfico'
    };
    
    const compositionTranslations = {
      en: 'centered composition',
      zh: '居中对称构图',
      fr: 'composition centrée',
      ja: '中央構図',
      es: 'composición centrada'
    };
    
    const qualityTranslations = {
      en: 'ultra-detailed, 8K clarity, professional grade',
      zh: '超高清细节，8K画质，专业级',
      fr: 'ultra-détaillé, clarté 8K, qualité professionnelle',
      ja: '超高精細、8K画質、プロフェッショナルグレード',
      es: 'ultra-detallado, claridad 8K, grado profesional'
    };
    
    const colorPalette: string[] = [];
    dominantColors.forEach(color => {
      const rgb = color.color;
      if (rgb) {
        const r = rgb.red || 0;
        const g = rgb.green || 0;
        const b = rgb.blue || 0;
        
        if (r > 200 && g > 200 && b > 200) {
          colorPalette.push(colorTranslations.bright[language]);
        } else if (r < 80 && g < 80 && b < 80) {
          colorPalette.push(colorTranslations.dark[language]);
        } else if (r > g + 30 && r > b + 30) {
          colorPalette.push(colorTranslations.warm[language]);
        } else if (b > r + 30 && b > g + 30) {
          colorPalette.push(colorTranslations.cool[language]);
        } else if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
          colorPalette.push(colorTranslations.neutral[language]);
        }
      }
    });
    
    let visualStyle = styleTranslations[language];
    let composition = compositionTranslations[language];
    let quality = qualityTranslations[language];
    
    const actionTranslations = {
      en: 'in static display',
      zh: '静态展示',
      fr: 'en affichage statique',
      ja: '静的な表示',
      es: 'en exhibición estática'
    };
    
    const videoActionTranslations = {
      en: 'with smooth camera movement',
      zh: '镜头平滑移动',
      fr: 'avec mouvement de caméra fluide',
      ja: 'スムーズなカメラの動き',
      es: 'con movimiento de cámara suave'
    };
    
    let action = actionTranslations[language];
    const separator = (language === 'zh' || language === 'ja') ? '、' : ', ';
    const specificFocus = topLabels.slice(0, 3).join(separator);
    const colorKeywords = colorPalette.join(separator);
    
    if (modelStyle === 'midjourney') {
      const midjourneyStyleTranslations = {
        en: 'artistic photography style, highly detailed, award-winning',
        zh: '艺术摄影风格，高度细节，获奖作品',
        fr: 'style photographique artistique, très détaillé, primé',
        ja: 'アーティスティックな写真スタイル、高度に詳細、受賞作品',
        es: 'estilo fotográfico artístico, muy detallado, galardonado'
      };
      visualStyle = midjourneyStyleTranslations[language];
      
      const midjourneyQualityTranslations = {
        en: 'masterpiece, best quality, ultra-detailed, 8K, trending on ArtStation',
        zh: '杰作，最佳质量，超高细节，8K，ArtStation热门',
        fr: 'chef-d\'œuvre, meilleure qualité, ultra-détaillé, 8K, tendance sur ArtStation',
        ja: '傑作、最高品質、超高精細、8K、ArtStationでトレンド',
        es: 'obra maestra, mejor calidad, ultra-detallado, 8K, tendencia en ArtStation'
      };
      quality = midjourneyQualityTranslations[language];
      
    } else if (modelStyle === 'stable-diffusion') {
      const sdStyleTranslations = {
        en: 'digital art style, concept art quality',
        zh: '数字艺术风格，概念艺术质量',
        fr: 'style d\'art numérique, qualité d\'art conceptuel',
        ja: 'デジタルアートスタイル、コンセプトアート品質',
        es: 'estilo de arte digital, calidad de arte conceptual'
      };
      visualStyle = sdStyleTranslations[language];
      
      const sdQualityTranslations = {
        en: 'masterpiece, best quality, highly detailed, sharp focus, professional, 4k, 8k',
        zh: '杰作，最佳质量，高度细节，清晰聚焦，专业，4k，8k',
        fr: 'chef-d\'œuvre, meilleure qualité, très détaillé, mise au point nette, professionnel, 4k, 8k',
        ja: '傑作、最高品質、高度に詳細、シャープフォーカス、プロフェッショナル、4k、8k',
        es: 'obra maestra, mejor calidad, muy detallado, enfoque nítido, profesional, 4k, 8k'
      };
      quality = sdQualityTranslations[language];
      
    } else if (modelStyle === 'flux') {
      const fluxStyleTranslations = {
        en: 'photorealistic, DSLR photography, professional studio lighting',
        zh: '照片写实，单反摄影，专业工作室照明',
        fr: 'photoréaliste, photographie DSLR, éclairage de studio professionnel',
        ja: 'フォトリアリスティック、デジタル一眼レフ撮影、プロのスタジオ照明',
        es: 'fotorrealista, fotografía DSLR, iluminación de estudio profesional'
      };
      visualStyle = fluxStyleTranslations[language];
      
      const fluxQualityTranslations = {
        en: 'RAW photo, 8k UHD, film grain, Fujifilm XT3, professional photography',
        zh: 'RAW格式照片，8k超高清，胶片颗粒，富士XT3，专业摄影',
        fr: 'photo RAW, 8k UHD, grain de film, Fujifilm XT3, photographie professionnelle',
        ja: 'RAW写真、8k UHD、フィルムグレイン、富士フイルムXT3、プロ写真',
        es: 'foto RAW, 8k UHD, grano de película, Fujifilm XT3, fotografía profesional'
      };
      quality = fluxQualityTranslations[language];
      
    } else if (modelStyle === 'sora2' || modelStyle === 'veo3') {
      action = videoActionTranslations[language];
      
      const videoStyleTranslations = {
        en: 'cinematic video style, dynamic camera work',
        zh: '电影视频风格，动态摄影',
        fr: 'style vidéo cinématographique, travail de caméra dynamique',
        ja: 'シネマティックビデオスタイル、ダイナミックなカメラワーク',
        es: 'estilo de video cinematográfico, trabajo de cámara dinámico'
      };
      visualStyle = videoStyleTranslations[language];
      
      const videoCompositionTranslations = {
        en: 'smooth camera pan, professional cinematography',
        zh: '平滑摄像机平移，专业电影摄影',
        fr: 'panoramique fluide, cinématographie professionnelle',
        ja: 'スムーズなカメラパン、プロの映画撮影',
        es: 'panorámica suave de cámara, cinematografía profesional'
      };
      composition = videoCompositionTranslations[language];
      
      const videoQualityTranslations = {
        en: '4K video quality, 24fps, cinematic motion blur, smooth transitions',
        zh: '4K视频质量，24帧，电影运动模糊，平滑过渡',
        fr: 'qualité vidéo 4K, 24fps, flou de mouvement cinématographique, transitions fluides',
        ja: '4Kビデオ品質、24fps、シネマティックモーションブラー、スムーズなトランジション',
        es: 'calidad de video 4K, 24fps, desenfoque de movimiento cinematográfico, transiciones suaves'
      };
      quality = videoQualityTranslations[language];
    }
    
    let structuredPrompt = '';
    
    if (language === 'zh') {
      structuredPrompt = `一个${mainSubject} ${action}，位于${environment}，` +
        `在${lighting}${timeOfDay}的条件下，营造${mood}的氛围，` +
        `采用${visualStyle}，${composition}的构图方式，` +
        `展现${specificFocus}等视觉细节。` +
        `${quality}` + 
        (colorKeywords ? `，${colorKeywords}色调` : '');
    } else if (language === 'ja') {
      structuredPrompt = `${mainSubject}が${action}で、${environment}に配置され、` +
        `${timeOfDay}の${lighting}の下で、${mood}雰囲気を演出し、` +
        `${visualStyle}で、${composition}で撮影され、` +
        `${specificFocus}を表示します。` +
        `${quality}` +
        (colorKeywords ? `、${colorKeywords}` : '');
    } else if (language === 'fr') {
      structuredPrompt = `Un ${mainSubject} ${action}, dans ${environment}, ` +
        `sous ${lighting} pendant ${timeOfDay}, créant une atmosphère ${mood}, ` +
        `dans le style de ${visualStyle}, ` +
        `capturé avec ${composition}, ` +
        `montrant ${specificFocus}. ` +
        `${quality}` +
        (colorKeywords ? `, ${colorKeywords}` : '');
    } else if (language === 'es') {
      structuredPrompt = `Un ${mainSubject} ${action}, en ${environment}, ` +
        `bajo ${lighting} durante ${timeOfDay}, transmitiendo una atmósfera ${mood}, ` +
        `al estilo de ${visualStyle}, ` +
        `capturado con ${composition}, ` +
        `mostrando ${specificFocus}. ` +
        `${quality}` +
        (colorKeywords ? `, ${colorKeywords}` : '');
    } else {
      structuredPrompt = `A ${mainSubject} ${action}, in ${environment}, ` +
        `under ${lighting} during ${timeOfDay}, conveying a ${mood} atmosphere, ` +
        `in the style of ${visualStyle}, ` +
        `captured with ${composition}, ` +
        `showing ${specificFocus}. ` +
        `${quality}` +
        (colorKeywords ? `, ${colorKeywords}` : '');
    }
    
    return {
      success: true,
      prompt: structuredPrompt.trim(),
      rawData: {
        labels: topLabels,
        objects: topObjects,
        colors: dominantColors.length,
        faces: faces.length,
        hasText: texts.length > 0,
      },
    };
    
  } catch (error) {
    console.error('Vision API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      prompt: '',
    };
  }
}
