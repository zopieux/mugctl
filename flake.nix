{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let pkgs = nixpkgs.legacyPackages."x86_64-linux";
    in {
      packages."x86_64-linux".default = pkgs.mkYarnPackage {
        pname = "mugctl";
        src = ./.;
        packageJSON = ./package.json;
        yarnLock = ./yarn.lock;
      };
      packages."x86_64-linux".devShells.default = with pkgs; mkShell {
        nativeBuildInputs = [ nodejs yarn ];
      };
    };
}
