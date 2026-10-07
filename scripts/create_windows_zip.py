import os
import zipfile

def build_zip():
    zip_path = 'public/hydro-mec-stampa-cartellini-windows11.zip'
    os.makedirs('public', exist_ok=True)
    
    files_to_include = [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'index.html',
        'metadata.json',
        '.env.example',
        '.gitignore',
        'AVVIA_APP.bat',
        'GUIDA_INSTALLAZIONE_WINDOWS_11.md'
    ]
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for f in files_to_include:
            if os.path.exists(f):
                zipf.write(f, arcname=f)
                print(f"Added {f}")
        
        # Add src directory recursively
        for root, dirs, files in os.walk('src'):
            for file in files:
                full_path = os.path.join(root, file)
                zipf.write(full_path, arcname=full_path)
                print(f"Added {full_path}")
                
        # Add public directory assets (except the zip itself!)
        for root, dirs, files in os.walk('public'):
            for file in files:
                if file.endswith('.zip'):
                    continue
                full_path = os.path.join(root, file)
                zipf.write(full_path, arcname=full_path)
                print(f"Added {full_path}")
                
    print(f"\nSuccessfully generated {zip_path}, size: {os.path.getsize(zip_path)} bytes")

if __name__ == '__main__':
    build_zip()
