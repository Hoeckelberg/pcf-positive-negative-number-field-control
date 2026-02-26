# GreenRedField PCF Component

## Deployment & Build Methoden

### Weg 1: Developer Push (Quick & Dirty)
Erstellt eine temporäre *unmanaged* Solution (`PowerAppsTools_[Prefix]`) und pusht sie direkt in die Dev-Umgebung.

```powershell
pac pcf push --publisher-prefix dev
```

### Weg 2: Production Build (Managed/Unmanaged via cdsproj)
Erstellt eine ordentliche Solution-Datei (.zip) mit festem Publisher zur manuellen Installation.

1. **Solution-Ordner initialisieren & Publisher setzen:**
   ```powershell
   mkdir Solution
   cd Solution
   pac solution init --publisher-name <DeinPublisher> --publisher-prefix <prefix>
   ```

2. **PCF-Control zur Solution hinzufügen:**
   ```powershell
   pac solution add-reference --path ..\GreenRedField
   ```

3. **Solution als ZIP builden:**
   
   *Unmanaged Build:*
   ```powershell
   dotnet build
   # Output: Solution\bin\Debug\Solution.zip
   ```

   *Managed Build:*
   ```powershell
   dotnet build -c Release
   # Output: Solution\bin\Release\Solution.zip
### Versions-Update
Wenn du eine neue Version bauen willst, erhöhe vorher die Version im `ControlManifest.Input.xml`. Das geht am schnellsten per Command im PCF-Ordner:
```powershell
pac pcf version --strategy manifest
