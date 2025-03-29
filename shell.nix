{
  pkgs ? import <nixpkgs> { },
}:
with pkgs;
mkShell {
  buildInputs = [

  ];

  packages = [
    curl
    parallel
    unzip
    yq
    (import ./stig-viewer.nix { inherit pkgs; })
  ];
}
