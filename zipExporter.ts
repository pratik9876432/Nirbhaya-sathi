import JSZip from 'jszip';
import { PREBUILT_ZIP_BASE64 } from './prebuiltZipBase64';

/**
 * Downloads the production deployable zip file using multiple bulletproof strategies:
 * 1. Embedded Base64 Instant Blob (Works 100% offline & within iframes without network)
 * 2. Fetch backend API endpoint '/api/download-zip'
 * 3. Client-side fallback dynamic zip generation using JSZip
 */
export async function downloadDeployZip(onProgress?: (msg: string) => void): Promise<boolean> {
  if (onProgress) onProgress('প্রস্তুত করা হচ্ছে...');

  // Strategy 1: Instant Inline Prebuilt Base64 (Zero network required, 100% works inside AI Studio iframe)
  try {
    if (typeof PREBUILT_ZIP_BASE64 === 'string' && PREBUILT_ZIP_BASE64.length > 1000) {
      if (onProgress) onProgress('প্যাকেজ ডিকোড করা হচ্ছে...');
      const byteCharacters = atob(PREBUILT_ZIP_BASE64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/zip' });

      triggerUniversalDownload(blob, 'nirbhaya_sathi_deploy.zip');
      if (onProgress) onProgress('✅ ডাউনলোড শুরু হয়েছে!');
      return true;
    }
  } catch (base64Err) {
    console.warn('Base64 instant download failed, falling back to fetch:', base64Err);
  }

  // Strategy 2: Fetch through Server API / Public ZIP
  try {
    if (onProgress) onProgress('সার্ভার থেকে প্রস্তুত জিপ ফাইল আনা হচ্ছে...');
    
    const response = await fetch('/api/download-zip');
    if (response.ok) {
      const blob = await response.blob();
      if (blob.size > 1000) {
        triggerUniversalDownload(blob, 'nirbhaya_sathi_deploy.zip');
        if (onProgress) onProgress('ডাউনলোড সফল হয়েছে!');
        return true;
      }
    }
  } catch (err) {
    console.warn('API zip fetch failed:', err);
  }

  // Strategy 3: Dynamic Client-side ZIP generation using JSZip
  try {
    if (onProgress) onProgress('ব্রাউজারে সরাসরি নতুন ZIP তৈরি করা হচ্ছে...');
    const zip = new JSZip();

    const indexHtmlRes = await fetch('/');
    const indexHtml = indexHtmlRes.ok ? await indexHtmlRes.text() : '<!DOCTYPE html><html><body>Nirbhaya Sathi</body></html>';
    zip.file('index.html', indexHtml);

    const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`;
    zip.file('.htaccess', htaccessContent);

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    triggerUniversalDownload(zipBlob, 'nirbhaya_sathi_deploy.zip');
    if (onProgress) onProgress('ডাউনলোড সম্পন্ন হয়েছে!');
    return true;
  } catch (err: any) {
    console.error('All zip strategies failed:', err);
    if (onProgress) onProgress('ত্রুটি: ' + (err.message || 'ডাউনলোড ব্যর্থ হয়েছে'));
    return false;
  }
}

/**
 * Universal Download Handler compatible with Iframe, Mobile, Safari, Chrome & Firefox
 */
export function triggerUniversalDownload(blob: Blob, fileName: string) {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.position = 'fixed';
    a.style.top = '-1000px';
    a.style.left = '-1000px';
    a.style.opacity = '0';
    a.href = url;
    a.download = fileName;
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 2000);
    return;
  } catch (e) {
    console.warn('Blob URL anchor click failed, trying DataURI:', e);
  }

  try {
    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target?.result as string;
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = dataUrl;
      a.download = fileName;
      a.setAttribute('download', fileName);
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 2000);
    };
    reader.readAsDataURL(blob);
  } catch (e2) {
    console.error('DataURI fallback also failed:', e2);
  }
}

