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
        # Vendored claude-code (./overlay.nix) tracks releases ahead of the
        # nixpkgs pin. Note: the sandbox from agentbox.mkClaudeSandbox uses
        # agentbox's own nixpkgs claude-code and is not affected by this.
        claudeCodeOverlay = final: prev: {
          claude-code = final.callPackage ./overlays/claude/overlay.nix { };
        };
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
          overlays = [ claudeCodeOverlay ];
        };
        packages = with pkgs; [
          nodejs_22
          curl
          parallel
          unzip
          yq-go
          jq
          ripgrep
          (import ./stig-viewer.nix { inherit pkgs; })
        ];
        box = agentbox.lib.${system};
        claude = box.mkClaudeSandbox {
          pkg = pkgs.claude-code;
          extraPackages = packages;
          allowedDomains = box.agentDomains // {
            "crates.io" = "*";
            "index.crates.io" = "*";
            "static.crates.io" = "*";
          };
        };
      in
      {
        packages.claude-code = pkgs.claude-code;

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
