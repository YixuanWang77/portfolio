Add-Type -AssemblyName System.Drawing
$ErrorActionPreference='Stop'
$assets=@(
 @{slug='digital-decay';file='image-8719.jpg';name='outcome'},
 @{slug='digital-decay';file='image-10.jpg';name='archive'},
 @{slug='digital-decay';file='image-8703.jpg';name='photo-detail'},
 @{slug='digital-decay';file='image-8715.jpg';name='assessment';crop=@(0.36,0.18,0.30,0.65)},
 @{slug='digital-decay';file='image-8711.jpg';name='pause';crop=@(0.36,0.18,0.30,0.65)},
 @{slug='digital-decay';file='image-8699.jpg';name='preserve'},
 @{slug='digital-decay';file='image-6385.jpg';name='story-recall'},
 @{slug='digital-decay';file='image-6405.jpg';name='story-review'},
 @{slug='digital-decay';file='image-6397.jpg';name='story-platforms'},
 @{slug='archflow';file='insole-public.jpg';name='insole-concept'},
 @{slug='archflow';file='image-8409.jpg';name='bench-prototype'},
 @{slug='google-news';file='image-14059.jpg';name='following'},
 @{slug='google-news';file='image-14063.jpg';name='interest-confirmation'},
 @{slug='sdg';file='image-48.jpg';name='wristband-concept';crop=@(0.01,0.25,0.25,0.69)}
)
$quality=New-Object System.Drawing.Imaging.EncoderParameters(1)
$quality.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,88L)
$codec=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
foreach($asset in $assets) {
 $source=Join-Path (Get-Location) ".local\materials\$($asset.slug)\$($asset.file)"
 $img=[System.Drawing.Image]::FromFile($source)
 $rect=New-Object System.Drawing.Rectangle(0,0,$img.Width,$img.Height)
 if($asset.crop) {$c=$asset.crop;$rect=New-Object System.Drawing.Rectangle([int]($img.Width*$c[0]),[int]($img.Height*$c[1]),[int]($img.Width*$c[2]),[int]($img.Height*$c[3]))}
 $dir=Join-Path (Get-Location) "site\assets\$($asset.slug)"
 New-Item -ItemType Directory -Path $dir -Force | Out-Null
 foreach($maxWidth in @(640,1280,1920)) {
  $w=[int][Math]::Min($maxWidth,$rect.Width)
  $h=[int][Math]::Round($rect.Height*$w/$rect.Width)
  $bmp=New-Object System.Drawing.Bitmap($w,$h)
  $g=[System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img,(New-Object System.Drawing.Rectangle(0,0,$w,$h)),$rect,[System.Drawing.GraphicsUnit]::Pixel)
  $bmp.Save((Join-Path $dir "$($asset.name)-$maxWidth.jpg"),$codec,$quality)
  $g.Dispose();$bmp.Dispose()
 }
 $img.Dispose()
}
