param([string]$File,[string]$Slug,[int]$Width=1920)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Data.Pdf.PdfDocument,Windows.Data.Pdf,ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.Streams.InMemoryRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.Streams.DataReader,Windows.Storage.Streams,ContentType=WindowsRuntime] | Out-Null
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 })[0]
function AwaitResult($operation,[Type]$type) { $task=$asTask.MakeGenericMethod($type).Invoke($null,@($operation));$task.Wait();$task.Result }
function AwaitAction($operation) { $method=([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and -not $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 })[0];$task=$method.Invoke($null,@($operation));$task.Wait() }
$storageFile=AwaitResult ([Windows.Storage.StorageFile]::GetFileFromPathAsync((Resolve-Path -LiteralPath $File).Path)) ([Windows.Storage.StorageFile])
$pdf=AwaitResult ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($storageFile)) ([Windows.Data.Pdf.PdfDocument])
$dir=Join-Path (Get-Location) ".local\materials\$Slug"
New-Item -ItemType Directory -Path $dir -Force | Out-Null
for($i=0;$i -lt $pdf.PageCount;$i++) {
 $page=$pdf.GetPage($i)
 $stream=New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
 $options=New-Object Windows.Data.Pdf.PdfPageRenderOptions
 $options.DestinationWidth=$Width
 AwaitAction ($page.RenderToStreamAsync($stream,$options))
 $stream.Seek(0)
 $reader=New-Object Windows.Storage.Streams.DataReader($stream)
 $length=[uint32]$stream.Size
 $null=AwaitResult ($reader.LoadAsync($length)) ([uint32])
 $bytes=New-Object byte[] $length
 $reader.ReadBytes($bytes)
 [System.IO.File]::WriteAllBytes((Join-Path $dir "page-$($i+1).png"),$bytes)
 $reader.Dispose();$stream.Dispose();$page.Dispose()
}
Write-Output "$Slug rendered $($pdf.PageCount) pages locally for research."
