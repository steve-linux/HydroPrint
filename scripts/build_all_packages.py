import os
import tarfile
import zipfile
import base64

def build_packages():
    os.makedirs('public', exist_ok=True)
    
    root_files = [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'index.html',
        'metadata.json',
        '.env.example',
        '.gitignore',
        '.npmrc',
        'AVVIA_APP.bat',
        'avvia_app.sh',
        'Hydro-Mec.desktop',
        'GUIDA_INSTALLAZIONE_WINDOWS_11.md',
        'GUIDA_INSTALLAZIONE_LINUX.md'
    ]
    
    # Copy scripts and guides to public folder for direct single-file downloads
    for f in ['avvia_app.sh', 'AVVIA_APP.bat', 'Hydro-Mec.desktop', 'GUIDA_INSTALLAZIONE_WINDOWS_11.md', 'GUIDA_INSTALLAZIONE_LINUX.md']:
        if os.path.exists(f):
            with open(f, 'rb') as src, open(os.path.join('public', f), 'wb') as dst:
                dst.write(src.read())

    # 1. Build Linux tar.gz
    tar_path = 'public/hydro-mec-stampa-cartellini-linux.tar.gz'
    with tarfile.open(tar_path, 'w:gz') as tar:
        for f in root_files:
            if os.path.exists(f):
                tar.add(f, arcname=f)
                
        for root, dirs, files in os.walk('src'):
            for file in files:
                full_path = os.path.join(root, file)
                tar.add(full_path, arcname=full_path)
                
        for root, dirs, files in os.walk('public'):
            for file in files:
                if file.endswith('.zip') or file.endswith('.tar.gz'):
                    continue
                full_path = os.path.join(root, file)
                tar.add(full_path, arcname=full_path)
    print(f"Generated {tar_path}, size: {os.path.getsize(tar_path)} bytes")

    # 2. Build Linux .zip
    linux_zip_path = 'public/hydro-mec-stampa-cartellini-linux.zip'
    with zipfile.ZipFile(linux_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for f in root_files:
            if os.path.exists(f):
                zipf.write(f, arcname=f)
                
        for root, dirs, files in os.walk('src'):
            for file in files:
                full_path = os.path.join(root, file)
                zipf.write(full_path, arcname=full_path)
                
        for root, dirs, files in os.walk('public'):
            for file in files:
                if file.endswith('.zip') or file.endswith('.tar.gz'):
                    continue
                full_path = os.path.join(root, file)
                zipf.write(full_path, arcname=full_path)
    print(f"Generated {linux_zip_path}, size: {os.path.getsize(linux_zip_path)} bytes")

    # 3. Update Windows .zip
    win_zip_path = 'public/hydro-mec-stampa-cartellini-windows11.zip'
    with zipfile.ZipFile(win_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for f in root_files:
            if os.path.exists(f):
                zipf.write(f, arcname=f)
                
        for root, dirs, files in os.walk('src'):
            for file in files:
                full_path = os.path.join(root, file)
                zipf.write(full_path, arcname=full_path)
                
        for root, dirs, files in os.walk('public'):
            for file in files:
                if file.endswith('.zip') or file.endswith('.tar.gz'):
                    continue
                full_path = os.path.join(root, file)
                zipf.write(full_path, arcname=full_path)
    print(f"Generated {win_zip_path}, size: {os.path.getsize(win_zip_path)} bytes")
    print("Package generation completed successfully.")

if __name__ == '__main__':
    build_packages()
