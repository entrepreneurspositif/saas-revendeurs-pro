Add-Type -AssemblyName System.Drawing

$sourcePath = "public\logo.jpg"
if (-not (Test-Path $sourcePath)) {
    $sourcePath = "public\logo.png"
}

Write-Output "Loading source image from $sourcePath"
$sourceImg = [System.Drawing.Image]::FromFile((Resolve-Path $sourcePath).Path)

function Resize-And-Save-Png {
    param(
        [System.Drawing.Image]$img,
        [int]$width,
        [int]$height,
        [string]$outputPath
    )
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
    $destImage = New-Object System.Drawing.Bitmap($width, $height)
    $destImage.SetResolution($img.HorizontalResolution, $img.VerticalResolution)

    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $wrapMode = New-Object System.Drawing.Imaging.ImageAttributes
    $wrapMode.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
    $graphics.DrawImage($img, $destRect, 0, 0, $img.Width, $img.Height, [System.Drawing.GraphicsUnit]::Pixel, $wrapMode)

    $graphics.Dispose()
    $destImage.Save((Resolve-Path .).Path + "\" + $outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destImage.Dispose()
    Write-Output "Created: $outputPath ($($width)x$($height) PNG)"
}

# 1. Generate PNGs in standard Google & Browser sizes
Resize-And-Save-Png $sourceImg 48 48 "public\icon-48x48.png"
Resize-And-Save-Png $sourceImg 96 96 "public\icon-96x96.png"
Resize-And-Save-Png $sourceImg 144 144 "public\icon-144x144.png"
Resize-And-Save-Png $sourceImg 192 192 "public\icon-192x192.png"
Resize-And-Save-Png $sourceImg 512 512 "public\icon-512x512.png"
Resize-And-Save-Png $sourceImg 180 180 "public\apple-touch-icon.png"
Resize-And-Save-Png $sourceImg 800 800 "public\logo.png"

# Also update src/app/icon.png and src/app/apple-icon.png with genuine PNGs
Resize-And-Save-Png $sourceImg 192 192 "src\app\icon.png"
Resize-And-Save-Png $sourceImg 180 180 "src\app\apple-icon.png"

# 2. Generate a valid multi-size Windows ICO file containing 16x16, 32x32, 48x48 PNGs
function Create-Png-Buffer {
    param([System.Drawing.Image]$img, [int]$size)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $destImage = New-Object System.Drawing.Bitmap($size, $size)
    $destImage.SetResolution($img.HorizontalResolution, $img.VerticalResolution)

    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $graphics.DrawImage($img, $destRect, 0, 0, $img.Width, $img.Height, [System.Drawing.GraphicsUnit]::Pixel)
    $graphics.Dispose()

    $ms = New-Object System.IO.MemoryStream
    $destImage.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $destImage.Dispose()
    $bytes = $ms.ToArray()
    $ms.Dispose()
    return ,$bytes
}

$icoSizes = @(16, 32, 48)
$icoBuffers = @()
foreach ($s in $icoSizes) {
    $icoBuffers += ,(Create-Png-Buffer $sourceImg $s)
}

$sourceImg.Dispose()

$icoFileStream = [System.IO.File]::Create((Resolve-Path .).Path + "\public\favicon.ico")
$bw = New-Object System.IO.BinaryWriter($icoFileStream)

# Header: Reserved (0), Type (1 = ICO), Count (3)
$bw.Write([uint16]0)
$bw.Write([uint16]1)
$bw.Write([uint16]$icoSizes.Count)

# Calculate image data offset: 6 (header) + 16 * count (entries)
$offset = 6 + (16 * $icoSizes.Count)

for ($i = 0; $i -lt $icoSizes.Count; $i++) {
    $size = $icoSizes[$i]
    $data = $icoBuffers[$i]
    $bw.Write([byte]$size)              # Width
    $bw.Write([byte]$size)              # Height
    $bw.Write([byte]0)                  # Color count
    $bw.Write([byte]0)                  # Reserved
    $bw.Write([uint16]1)                # Planes
    $bw.Write([uint16]32)               # Bit count
    $bw.Write([uint32]$data.Length)     # Size of PNG data
    $bw.Write([uint32]$offset)          # Offset to data
    $offset += $data.Length
}

for ($i = 0; $i -lt $icoSizes.Count; $i++) {
    $bw.Write($icoBuffers[$i])
}

$bw.Flush()
$bw.Close()
$icoFileStream.Close()

Write-Output "Created: public\favicon.ico (Multi-size Windows ICO with 16x16, 32x32, 48x48 PNG layers)"
