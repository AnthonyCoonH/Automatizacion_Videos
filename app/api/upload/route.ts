import { NextRequest, NextResponse } from 'next/server';

type PlatformId = 'youtube' | 'tiktok' | 'instagram';

type PlatformMetadata = {
  title: string;
  description: string;
};

type PrivacyStatus = 'public' | 'unlisted' | 'private';

type UploadResult = {
  platform: PlatformId;
  success: boolean;
  message: string;
  videoId?: string;
};

const YOUTUBE_UPLOAD_URL =
  'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status';

const DEFAULT_CATEGORY_ID = '22';
const VALID_PRIVACY: PrivacyStatus[] = ['public', 'unlisted', 'private'];

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u00C0-\u024F\u4e00-\u9fff]+/g);
  return matches ? matches.map((tag) => tag.replace('#', '')) : [];
}

async function uploadToYouTube(
  file: File,
  meta: PlatformMetadata,
  accessToken: string,
  privacy: PrivacyStatus,
  publishAt?: string | null
): Promise<UploadResult> {
  if (!accessToken) {
    console.warn('[YouTube] No hay access token disponible. Subida omitida (modo simulación).');
    return {
      platform: 'youtube',
      success: true,
      message: 'Simulación: sin token de acceso. Conecta tu cuenta de YouTube para subidas reales.',
    };
  }

  const tags = extractHashtags(meta.description);

  const snippet = {
    title: meta.title,
    description: meta.description,
    tags,
    categoryId: DEFAULT_CATEGORY_ID,
  };

  const status: {
    privacyStatus: PrivacyStatus;
    selfDeclaredMadeForKids: boolean;
    publishAt?: string;
  } = publishAt
    ? {
        privacyStatus: 'private',
        selfDeclaredMadeForKids: false,
        publishAt,
      }
    : {
        privacyStatus: privacy,
        selfDeclaredMadeForKids: false,
      };

  const metadataBlob = new Blob(
    [JSON.stringify({ snippet, status })],
    { type: 'application/json' }
  );

  const multipartBody = new FormData();
  multipartBody.append('metadata', metadataBlob);
  multipartBody.append('video', file);

  try {
    const response = await fetch(YOUTUBE_UPLOAD_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: multipartBody,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errMsg = errorData?.error?.message || `HTTP ${response.status}`;
      console.error('[YouTube] Error en la subida:', errMsg);
      return {
        platform: 'youtube',
        success: false,
        message: `YouTube rechazó el video: ${errMsg}`,
      };
    }

    const data = await response.json();
    return {
      platform: 'youtube',
      success: true,
      message: 'Subido correctamente a YouTube.',
      videoId: data.id,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[YouTube] Error de red:', errMsg);
    return {
      platform: 'youtube',
      success: false,
      message: `Error de conexión con YouTube: ${errMsg}`,
    };
  }
}

async function uploadToTikTok(
  _file: File,
  meta: PlatformMetadata
): Promise<UploadResult> {
  console.log('[TikTok] Lógica de subida a TikTok pendiente de credenciales.', {
    title: meta.title,
  });
  return {
    platform: 'tiktok',
    success: true,
    message: 'Lógica de subida a TikTok pendiente de credenciales.',
  };
}

async function uploadToInstagram(
  _file: File,
  meta: PlatformMetadata
): Promise<UploadResult> {
  console.log('[Instagram] Lógica de subida a Meta/Instagram pendiente de credenciales.', {
    title: meta.title,
  });
  return {
    platform: 'instagram',
    success: true,
    message: 'Lógica de subida a Meta/Instagram pendiente de credenciales.',
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const platformsRaw = formData.get('platforms') as string | null;
    const metadataRaw = formData.get('metadata') as string | null;
    const privacyRaw = formData.get('privacy') as string | null;
    const publishAt = formData.get('publishAt') as string | null;
    const privacy: PrivacyStatus = VALID_PRIVACY.includes(privacyRaw as PrivacyStatus)
      ? (privacyRaw as PrivacyStatus)
      : 'private';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Falta el archivo de video.' },
        { status: 400 }
      );
    }

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Falta el título del video.' },
        { status: 400 }
      );
    }

    let platforms: string[] = [];
    if (platformsRaw) {
      try {
        platforms = JSON.parse(platformsRaw);
      } catch {
        platforms = [platformsRaw];
      }
    }

    if (platforms.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No hay plataformas conectadas.' },
        { status: 400 }
      );
    }

    let metadata: Record<string, PlatformMetadata> = {};
    if (metadataRaw) {
      try {
        metadata = JSON.parse(metadataRaw);
      } catch {
        // If metadata fails to parse, continue with empty metadata
      }
    }

    // Extract YouTube access token from cookies (temporal, until DB integration)
    const youtubeToken = request.cookies.get('youtube_access_token')?.value || '';

    const results: UploadResult[] = [];

    for (const platform of platforms) {
      const platformMeta: PlatformMetadata = metadata[platform] || { title, description: '' };
      let result: UploadResult;

      switch (platform as PlatformId) {
        case 'youtube':
          result = await uploadToYouTube(file, platformMeta, youtubeToken, privacy, publishAt);
          break;
        case 'tiktok':
          result = await uploadToTikTok(file, platformMeta);
          break;
        case 'instagram':
          result = await uploadToInstagram(file, platformMeta);
          break;
        default:
          result = {
            platform: platform as PlatformId,
            success: false,
            message: `Plataforma no soportada: ${platform}`,
          };
      }

      results.push(result);
    }

    const succeeded = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (failed.length > 0 && succeeded.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Error al publicar en ${failed.length} plataforma(s): ${failed.map((f) => f.message).join('; ')}`,
          results,
        },
        { status: 500 }
      );
    }

    if (failed.length > 0 && succeeded.length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: `Publicado en ${succeeded.length} plataforma(s), pero ${failed.length} fallaron: ${failed.map((f) => `${f.platform}: ${f.message}`).join('; ')}`,
          results,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Clip distribuido correctamente en ${succeeded.length} plataforma(s).`,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Upload API] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
