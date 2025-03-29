{
  pkgs ? import <nixpkgs> { },
}:
with pkgs;
stdenv.mkDerivation rec {
  pname = "STIG Viewer 3";
  version = "3.5.1";

  src = fetchzip {
    url = "https://dl.dod.cyber.mil/wp-content/uploads/stigs/zip/U_STIGViewer-linux_x64-3-5-1.zip";
    sha256 = "sha256-J7FOt3PxajXAfjkmm/YOC1fINM2+jAMXQdEZz/TFLjc=";
  };

  buildInputs = [
    alsa-lib
    at-spi2-core
    cairo
    cups
    dbus
    expat
    glib
    gtk3
    libgbm
    libxkbcommon
    nspr
    nss
    pango
    xorg.libX11
    xorg.libxcb
    xorg.libXcomposite
    xorg.libXdamage
    xorg.libXext
    xorg.libXfixes
    xorg.libXrandr
  ];

  nativeBuildInputs = [
    unzip
    makeWrapper
  ];

  installPhase = ''
    mkdir -p $out/bin
    cp -r * $out/bin
    mv "$out/bin/STIG Viewer 3" $out/bin/stig-viewer-3

    wrapProgram $out/bin/stig-viewer-3 \
      --prefix LD_LIBRARY_PATH : "${lib.makeLibraryPath buildInputs}"
  '';
}
