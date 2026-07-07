{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    agentbox.url = "github:nealfennimore/agent-sandbox";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      agentbox,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
        packages = [
        ];
        box = agentbox.lib.${system};
        claude = box.mkClaudeSandbox {
          extraPackages =
            with pkgs;
            [

              nodejs_22
              curl
              parallel
              unzip
              yq-go
              jq
              ripgrep
              (import ./stig-viewer.nix { inherit pkgs; })
            ]
            ++ packages;
          allowedDomains = box.agentDomains // {
            "crates.io" = "*";
            "index.crates.io" = "*";
            "static.crates.io" = "*";
          };
        };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = [
            claude
          ]
          ++ packages;

          shellHook = "";
        };
      }
    );
}
