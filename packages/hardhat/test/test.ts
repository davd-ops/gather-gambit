import { BigNumber, Signer } from "ethers";
import { Berries, GatherGambit, BerryLands } from "../typechain-types/index";
import BerriesArtifact from "../artifacts/contracts/Berries.sol/Berries.json";
import GatherGambitArtifact from "../artifacts/contracts/GatherGambit.sol/GatherGambit.json";
import BerryLandsArtifact from "../artifacts/contracts/BerryLands.sol/BerryLands.json";
import { ethers, waffle } from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

const { deployContract } = waffle;
const { expect } = chai;
chai.use(chaiAsPromised);
let user: SignerWithAddress;
let contractOwner: SignerWithAddress;
let random: SignerWithAddress;
let Berries: Berries;
let GatherGambit: GatherGambit;
let BerryLands: BerryLands;
let gathererIndex = 0;
const mintGatherer = async () => {
  await GatherGambit.mint(contractOwner.address, "1");
  await mine(55);
  await GatherGambit.resolveEpochIfNecessary();
  const entity = await GatherGambit.getEntity(gathererIndex);
  if (entity !== 1) {
    gathererIndex++;
    mintGatherer();
  }
};

describe("Initialization of core functions", function () {
  beforeEach(async function () {
    [user, contractOwner] = await ethers.getSigners();

    Berries = (await deployContract(contractOwner, BerriesArtifact)) as Berries;

    GatherGambit = (await deployContract(
      contractOwner,
      GatherGambitArtifact
    )) as GatherGambit;

    BerryLands = (await deployContract(contractOwner, BerryLandsArtifact, [
      GatherGambit.address,
      Berries.address,
    ])) as BerryLands;
  });

  describe("Berries Contract", function () {
    describe("General Stuff", function () {
      it("should have proper owner", async function () {
        expect(await Berries.owner()).to.equal(contractOwner.address);
      });
      it("should have proper name", async function () {
        expect(await Berries.name()).to.equal("BERRIES");
      });
      it("should have proper symbol", async function () {
        expect(await Berries.symbol()).to.equal("BERRIES");
      });
      describe("mint()", async function () {
        it("shouldn't mint as non controller", async function () {
          await expect(
            Berries.connect(user).mint(contractOwner.address, "10")
          ).to.be.revertedWith("NotController()");
        });
        it("should mint as controller", async function () {
          await Berries.addController(user.address);
          expect(await Berries.balanceOf(contractOwner.address)).to.equal(
            BigNumber.from("0")
          );
          await Berries.connect(user).mint(contractOwner.address, "10");
          expect(await Berries.balanceOf(contractOwner.address)).to.equal(
            BigNumber.from("10")
          );
        });
        it("should mint as owner", async function () {
          expect(await Berries.balanceOf(contractOwner.address)).to.equal(
            BigNumber.from("0")
          );
          await Berries.mint(contractOwner.address, "10");
          expect(await Berries.balanceOf(contractOwner.address)).to.equal(
            BigNumber.from("10")
          );
        });
      });
      it("should burn 1000000000000000000000000000 BERRIES", async function () {
        await Berries.mint(
          contractOwner.address,
          "1000000000000000000000000000"
        );
        await Berries.burn("1000000000000000000000000000");
        expect(await Berries.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("0")
        );
      });
      it("should support ERC20 interface", async function () {
        expect(await Berries.supportsInterface("0x01ffc9a7")).to.equal(true);
      });
    });
  });
  describe("GatherGambit Contract", function () {
    beforeEach(async function () {
      await mine(1000);
      await Berries.addController(BerryLands.address);
    });
    describe("General Stuff", function () {
      it("should have proper owner", async function () {
        expect(await GatherGambit.owner()).to.equal(contractOwner.address);
      });
      it("should have proper name", async function () {
        expect(await GatherGambit.name()).to.equal("Gather Gambit");
      });
      it("should have proper symbol", async function () {
        expect(await GatherGambit.symbol()).to.equal("GAMBIT");
      });
      it("mint()", async function () {
        expect(await GatherGambit.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("0")
        );
        await GatherGambit.mint(contractOwner.address, "10");
        expect(await GatherGambit.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("10")
        );
      });
      it("burn()", async function () {
        await GatherGambit.mint(contractOwner.address, "10");
        await GatherGambit.burn("0");
        expect(await GatherGambit.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("9")
        );
      });
      it("not approved burn()", async function () {
        await GatherGambit.mint(contractOwner.address, "10");
        await expect(GatherGambit.connect(user).burn("0")).to.be.revertedWith(
          "TransferCallerNotOwnerNorApproved()"
        );
        expect(await GatherGambit.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("10")
        );
      });
      it("burnBatch()", async function () {
        await GatherGambit.mint(contractOwner.address, "10");
        await GatherGambit.burnBatch([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        expect(await GatherGambit.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("0")
        );
      });
      it("not approved burnBatch()", async function () {
        await GatherGambit.mint(contractOwner.address, "10");
        await expect(
          GatherGambit.connect(user).burnBatch([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        ).to.be.revertedWith("TransferCallerNotOwnerNorApproved()");
        expect(await GatherGambit.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("10")
        );
      });
      it("resolveEpochIfNecessary()", async function () {
        await GatherGambit.resolveEpochIfNecessary();
        expect(await GatherGambit.getCurrentEpochIndex()).to.equal(
          BigNumber.from("0")
        );
      });
      it("getEntity()", async function () {
        await GatherGambit.mint(contractOwner.address, "10");
        expect(await GatherGambit.getEntity(0)).to.equal(BigNumber.from("0"));
      });
      it("tokenURI()", async function () {
        await expect(GatherGambit.tokenURI(0)).to.be.revertedWith(
          "QueryForNonexistentToken()"
        );
        await GatherGambit.mint(contractOwner.address, "1");
        expect(await GatherGambit.tokenURI(0)).to.be.equal(
          "data:application/json;base64,eyJuYW1lIjogIlVucmV2ZWFsZWQgIzAiLCAiZGVzY3JpcHRpb24iOiAiR2F0aGVyIEdhbWJpdCBnYW1lLiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LGFWWkNUMUozTUV0SFoyOUJRVUZCVGxOVmFFVlZaMEZCUVVOQlFVRkJRV2RCWjAxQlFVRkJUMFpLU201QlFVRkJSRVpDVFZaRlZVRkJRVUZ1U25salFVRkJRbFZXUmxSNmRFUTVkMEZCUVVGQldGSlRWR3hOUVZGUFlsbGFaMEZCUVVKV1NsSkZSbFZIVGs1cVIwUjVRVUpqWWxGb1ZFVTBSMEZaWTBGQlFXZExRVUUyYjFCVWNHZDNRVUZCUVVKS1VsVTFSWEpyU21kblp6MDkifQ=="
        );

        await mine(55);

        expect(await GatherGambit.tokenURI(0)).to.be.equal(
          "data:application/json;base64,eyJuYW1lIjogIlVucmV2ZWFsZWQgIzAiLCAiZGVzY3JpcHRpb24iOiAiR2F0aGVyIEdhbWJpdCBnYW1lLiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LGFWWkNUMUozTUV0SFoyOUJRVUZCVGxOVmFFVlZaMEZCUVVOQlFVRkJRV2RCWjAxQlFVRkJUMFpLU201QlFVRkJSRVpDVFZaRlZVRkJRVUZ1U25salFVRkJRbFZXUmxSNmRFUTVkMEZCUVVGQldGSlRWR3hOUVZGUFlsbGFaMEZCUVVKV1NsSkZSbFZIVGs1cVIwUjVRVUpqWWxGb1ZFVTBSMEZaWTBGQlFXZExRVUUyYjFCVWNHZDNRVUZCUVVKS1VsVTFSWEpyU21kblp6MDkifQ=="
        );

        await GatherGambit.resolveEpochIfNecessary();

        expect(await GatherGambit.tokenURI(0)).to.not.be.equal(
          "data:application/json;base64,eyJuYW1lIjogIlVucmV2ZWFsZWQgIzAiLCAiZGVzY3JpcHRpb24iOiAiR2F0aGVyIEdhbWJpdCBnYW1lLiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LGFWWkNUMUozTUV0SFoyOUJRVUZCVGxOVmFFVlZaMEZCUVVOQlFVRkJRV2RCWjAxQlFVRkJUMFpLU201QlFVRkJSRVpDVFZaRlZVRkJRVUZ1U25salFVRkJRbFZXUmxSNmRFUTVkMEZCUVVGQldGSlRWR3hOUVZGUFlsbGFaMEZCUVVKV1NsSkZSbFZIVGs1cVIwUjVRVUpqWWxGb1ZFVTBSMEZaWTBGQlFXZExRVUUyYjFCVWNHZDNRVUZCUVVKS1VsVTFSWEpyU21kblp6MDkifQ=="
        );
      });
      it("should support 721 interface", async function () {
        expect(await GatherGambit.supportsInterface("0x80ac58cd")).to.equal(
          true
        );
      });
    });
    describe("BerryLands interaction", async function () {
      beforeEach(async function () {
        await expect(
          GatherGambit.setStakingContract(BerryLands.address)
        ).to.be.fulfilled;
      });
      it("should be properly initialized", async function () {
        expect(await GatherGambit.getStakingContract()).to.equal(
          BerryLands.address
        );
        expect(await BerryLands.getGambitContract()).to.equal(
          GatherGambit.address
        );
        expect(await BerryLands.getBerriesContract()).to.equal(Berries.address);
      });
      describe("enterBerryLands()", async function () {
        beforeEach(async function () {
          gathererIndex = 0;
          await mintGatherer();
        });
        describe("FertileFields", async function () {
          it("should revert if not exist", async function () {
            await expect(
              BerryLands.enterBerryLands(10, 0)
            ).to.be.revertedWith("QueryForNonexistentToken()");
          });
          it("should revert if not approved", async function () {
            await GatherGambit.mint(contractOwner.address, "1");
            await expect(
              BerryLands.enterBerryLands(gathererIndex, 0)
            ).to.be.revertedWith(
              "TransferCallerNotOwnerNorApproved()"
            );
          });
          it("should be successful", async function () {
            await GatherGambit.approve(BerryLands.address, gathererIndex);
            await expect(BerryLands.enterBerryLands(gathererIndex, 0)).to.be
              .fulfilled;
          });
        });
        describe("WhisperingWoods", async function () {
          it("should revert if not exist", async function () {
            await expect(
              BerryLands.enterBerryLands(10, 0)
            ).to.be.revertedWith("QueryForNonexistentToken()");
          });
          it("should revert if not approved", async function () {
            await GatherGambit.mint(contractOwner.address, "1");
            await expect(
              BerryLands.enterBerryLands(gathererIndex, 0)
            ).to.be.revertedWith(
              "TransferCallerNotOwnerNorApproved()"
            );
          });
          it("should be successful", async function () {
            await GatherGambit.approve(BerryLands.address, gathererIndex);
            await expect(BerryLands.enterBerryLands(gathererIndex, 0)).to.be
              .fulfilled;
          });
        });
      });
      describe("exitBerryLands()", async function () {
        it("getClaimableBerries()", async function () {
          gathererIndex = 0;
          await mintGatherer();
          await GatherGambit.approve(BerryLands.address, gathererIndex);
          await BerryLands.enterBerryLands(gathererIndex, 0);
          expect(await BerryLands.getClaimableBerries(gathererIndex, 0)).to.above(
            BigNumber.from("0")
          );
        });
        describe("FertileFields", async function () {
          beforeEach(async function () {
            gathererIndex = 0;
            await mintGatherer();
            
            await GatherGambit.approve(BerryLands.address, gathererIndex);
            await BerryLands.enterBerryLands(gathererIndex, 0);
          });
          it("should revert if not token owner", async function () {
            await expect(
              BerryLands.connect(user).exitBerryLands(gathererIndex, 0)
            ).to.be.revertedWith("NoPermission()");
          });
          it("should be successful", async function () {
            const initialBalance = await GatherGambit.balanceOf(contractOwner.address);
            await expect(BerryLands.exitBerryLands(gathererIndex, 0)).to.be
              .fulfilled;
              expect(await GatherGambit.balanceOf(contractOwner.address)).to.be.above(
                initialBalance
              );
            expect(await Berries.balanceOf(contractOwner.address)).to.be.above(
              BigNumber.from("0")
            );
          });
        });
        describe("WhisperingWoods", async function () {
          beforeEach(async function () {
            gathererIndex = 0;
            await mintGatherer();
            
            await GatherGambit.approve(BerryLands.address, gathererIndex);
            await BerryLands.enterBerryLands(gathererIndex, 1);
          });
          it("should revert if not token owner", async function () {
            await expect(
              BerryLands.connect(user).exitBerryLands(gathererIndex, 1)
            ).to.be.revertedWith("NoPermission()");
          });
          it("should be successful", async function () {
            const initialBalance = await GatherGambit.balanceOf(contractOwner.address);
            await expect(BerryLands.exitBerryLands(gathererIndex, 1)).to.be
              .fulfilled;
              expect(await GatherGambit.balanceOf(contractOwner.address)).to.be.above(
                initialBalance
              );
            expect(await Berries.balanceOf(contractOwner.address)).to.be.above(
              BigNumber.from("0")
            );
          });
        });
      });
    });
  });
});
