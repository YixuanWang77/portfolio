param([string]$Slug)
Add-Type -AssemblyName System.Drawing
$dir = Join-Path (Get-Location) ".local\materials\$Slug"
$files = Get-ChildItem -LiteralPath $dir -File | Where-Object Extension -eq '.jpg'
$font = New-Object System.Drawing.Font('Arial',10)
for ($offset=0; $offset -lt $files.Count; $offset+=30) {
  $batch = @($files | Select-Object -Skip $offset -First 30)
  $canvas = New-Object System.Drawing.Bitmap(1250, (180 * [int][Math]::Ceiling($batch.Count / 5)))
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.Clear([System.Drawing.Color]::White)
  for ($i=0; $i -lt $batch.Count; $i++) {
    $img=[System.Drawing.Image]::FromFile($batch[$i].FullName)
    $ratio=[Math]::Min(240/$img.Width,150/$img.Height)
    $x=($i%5)*250
    $y=[Math]::Floor($i/5)*180
    $g.DrawImage($img,[int]$x,[int]$y,[int]($img.Width*$ratio),[int]($img.Height*$ratio))
    $g.DrawString($batch[$i].Name,$font,[System.Drawing.Brushes]::Black,[float]$x,[float]($y+155))
    $img.Dispose()
  }
  $canvas.Save((Join-Path $dir "sheet-$offset.jpg"),[System.Drawing.Imaging.ImageFormat]::Jpeg)
  $g.Dispose(); $canvas.Dispose()
}
$font.Dispose()
