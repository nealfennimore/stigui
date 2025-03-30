{
  pkgs ? import <nixpkgs> { },
}:
with pkgs;
mkShell {
  buildInputs = [

  ];

  packages = [
    nodejs_22
    curl
    parallel
    unzip
    yq
    (import ./stig-viewer.nix { inherit pkgs; })
  ];
}
