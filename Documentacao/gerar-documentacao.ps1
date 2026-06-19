$ErrorActionPreference = 'Stop'

$documentationRoot = $PSScriptRoot
$projectRoot = Split-Path -Parent $documentationRoot
$projectName = Split-Path -Leaf $projectRoot
$excludedDirectories = @('.git', 'node_modules', 'dist', 'Documentacao')

function Test-IsExcludedPath {
    param(
        [Parameter(Mandatory = $true)]
        [string] $FullName
    )

    $relativePath = $FullName.Substring($projectRoot.Length).TrimStart('\')
    if ([string]::IsNullOrWhiteSpace($relativePath)) {
        return $false
    }

    foreach ($segment in ($relativePath -split '\\')) {
        if ($excludedDirectories -contains $segment) {
            return $true
        }
    }

    return $false
}

function Ensure-Directory {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

function Write-MarkdownFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path,

        [AllowEmptyString()]
        [Parameter(Mandatory = $true)]
        [string[]] $Lines
    )

    $parent = Split-Path -Parent $Path
    Ensure-Directory -Path $parent
    Set-Content -LiteralPath $Path -Value $Lines -Encoding UTF8
}

function Get-RelativeProjectPath {
    param(
        [Parameter(Mandatory = $true)]
        [string] $FullName
    )

    $relativePath = $FullName.Substring($projectRoot.Length).TrimStart('\')
    if ([string]::IsNullOrWhiteSpace($relativePath)) {
        return '.'
    }

    return $relativePath -replace '\\', '/'
}

function New-FolderMarkdown {
    param(
        [Parameter(Mandatory = $true)]
        [string] $SourceDirectory,

        [Parameter(Mandatory = $true)]
        [string] $TargetDirectory
    )

    $directoryName = Split-Path -Leaf $SourceDirectory
    $relativePath = Get-RelativeProjectPath -FullName $SourceDirectory
    $markdownPath = Join-Path $TargetDirectory "$directoryName(#).md"

    Write-MarkdownFile -Path $markdownPath -Lines @(
        "# Pasta: $directoryName",
        "",
        "- Caminho original: ``$relativePath``",
        "- Tipo: Pasta",
        "",
        "## Objetivo",
        "Descreva aqui a responsabilidade desta pasta no projeto.",
        "",
        "## Conteudo",
        "Liste aqui os principais arquivos e subpastas quando necessario."
    )
}

function New-FileMarkdown {
    param(
        [Parameter(Mandatory = $true)]
        [string] $SourceFile,

        [Parameter(Mandatory = $true)]
        [string] $TargetDirectory
    )

    $fileName = Split-Path -Leaf $SourceFile
    $relativePath = Get-RelativeProjectPath -FullName $SourceFile
    $extension = [IO.Path]::GetExtension($SourceFile)
    $markdownPath = Join-Path $TargetDirectory "$fileName.md"

    Write-MarkdownFile -Path $markdownPath -Lines @(
        "# Arquivo: $fileName",
        "",
        "- Caminho original: ``$relativePath``",
        "- Tipo: Arquivo",
        "- Extensao: ``$extension``",
        "",
        "## Finalidade",
        "Descreva aqui o papel deste arquivo no projeto.",
        "",
        "## Observacoes",
        "Adicione detalhes importantes, dependencias e pontos de atencao."
    )
}

Ensure-Directory -Path $documentationRoot

New-FolderMarkdown -SourceDirectory $projectRoot -TargetDirectory $documentationRoot

$directories = Get-ChildItem -LiteralPath $projectRoot -Directory -Recurse |
    Where-Object { -not (Test-IsExcludedPath -FullName $_.FullName) } |
    Sort-Object FullName

foreach ($directory in $directories) {
    $relativePath = $directory.FullName.Substring($projectRoot.Length).TrimStart('\')
    $targetDirectory = Join-Path $documentationRoot $relativePath

    Ensure-Directory -Path $targetDirectory
    New-FolderMarkdown -SourceDirectory $directory.FullName -TargetDirectory $targetDirectory
}

$files = Get-ChildItem -LiteralPath $projectRoot -File -Recurse |
    Where-Object { -not (Test-IsExcludedPath -FullName $_.FullName) } |
    Sort-Object FullName

foreach ($file in $files) {
    $relativeDirectory = Split-Path -Parent ($file.FullName.Substring($projectRoot.Length).TrimStart('\'))
    $targetDirectory = if ([string]::IsNullOrWhiteSpace($relativeDirectory)) {
        $documentationRoot
    }
    else {
        Join-Path $documentationRoot $relativeDirectory
    }

    New-FileMarkdown -SourceFile $file.FullName -TargetDirectory $targetDirectory
}

Write-Host "Documentacao gerada em $documentationRoot"
