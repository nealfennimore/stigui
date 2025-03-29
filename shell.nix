{
  pkgs ? import <nixpkgs> { },
}:
with pkgs;
mkShell {
  buildInputs = [

  ];

  shellHook = ''

  '';

  packages = [
    unzip
  ];
}
