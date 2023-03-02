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
let gathererIndex = 1;
let protectorIndex = 1;
let wolfIndex = 1;

const mintGatherer = async () => {
  await GatherGambit.mint(contractOwner.address, "1");
  await mine(55);
  await GatherGambit.resolveEpochIfNecessary();
  const entity = await GatherGambit.getEntity(gathererIndex);

  if (entity !== 1) {
    gathererIndex++;
    await mintGatherer();
  }
};
const mintProtector = async () => {
  await GatherGambit.mint(contractOwner.address, "1");
  await mine(55);
  await GatherGambit.resolveEpochIfNecessary();
  const entity = await GatherGambit.getEntity(protectorIndex);

  if (entity !== 2) {
    protectorIndex++;
    await mintProtector();
  }
};
const mintWolf = async () => {
  await GatherGambit.mint(contractOwner.address, "1");
  await mine(55);
  await GatherGambit.resolveEpochIfNecessary();
  const entity = await GatherGambit.getEntity(wolfIndex);

  if (entity !== 3) {
    wolfIndex++;
    await mintWolf();
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

  describe.skip("Berries Contract", function () {
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
    describe.skip("General Stuff", function () {
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
        await GatherGambit.burn("1");
        expect(await GatherGambit.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("9")
        );
      });
      it("not approved burn()", async function () {
        await GatherGambit.mint(contractOwner.address, "10");
        await expect(GatherGambit.connect(user).burn("1")).to.be.revertedWith(
          "TransferCallerNotOwnerNorApproved()"
        );
        expect(await GatherGambit.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("10")
        );
      });
      it("burnBatch()", async function () {
        await GatherGambit.mint(contractOwner.address, "10");
        await GatherGambit.burnBatch([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(await GatherGambit.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("0")
        );
      });
      it("not approved burnBatch()", async function () {
        await GatherGambit.mint(contractOwner.address, "10");
        await expect(
          GatherGambit.connect(user).burnBatch([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
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
        expect(await GatherGambit.getEntity(1)).to.equal(BigNumber.from("0"));
      });
      it("tokenURI()", async function () {
        await expect(GatherGambit.tokenURI(1)).to.be.revertedWith(
          "QueryForNonexistentToken()"
        );
        await GatherGambit.mint(contractOwner.address, "1");
        expect(await GatherGambit.tokenURI(1)).to.be.equal(
          "data:application/json;base64,eyJuYW1lIjogIlVucmV2ZWFsZWQgIzEiLCAiZGVzY3JpcHRpb24iOiAiR2F0aGVyIEdhbWJpdCBnYW1lLiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LGFWWkNUMUozTUV0SFoyOUJRVUZCVGxOVmFFVlZaMEZCUVVOQlFVRkJRV2RCWjAxQlFVRkJUMFpLU201QlFVRkJSRVpDVFZaRlZVRkJRVUZ1U25salFVRkJRbFZXUmxSNmRFUTVkMEZCUVVGQldGSlRWR3hOUVZGUFlsbGFaMEZCUVVKV1NsSkZSbFZIVGs1cVIwUjVRVUpqWWxGb1ZFVTBSMEZaWTBGQlFXZExRVUUyYjFCVWNHZDNRVUZCUVVKS1VsVTFSWEpyU21kblp6MDkifQ=="
        );

        await mine(55);

        expect(await GatherGambit.tokenURI(1)).to.be.equal(
          "data:application/json;base64,eyJuYW1lIjogIlVucmV2ZWFsZWQgIzEiLCAiZGVzY3JpcHRpb24iOiAiR2F0aGVyIEdhbWJpdCBnYW1lLiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LGFWWkNUMUozTUV0SFoyOUJRVUZCVGxOVmFFVlZaMEZCUVVOQlFVRkJRV2RCWjAxQlFVRkJUMFpLU201QlFVRkJSRVpDVFZaRlZVRkJRVUZ1U25salFVRkJRbFZXUmxSNmRFUTVkMEZCUVVGQldGSlRWR3hOUVZGUFlsbGFaMEZCUVVKV1NsSkZSbFZIVGs1cVIwUjVRVUpqWWxGb1ZFVTBSMEZaWTBGQlFXZExRVUUyYjFCVWNHZDNRVUZCUVVKS1VsVTFSWEpyU21kblp6MDkifQ=="
        );

        await GatherGambit.resolveEpochIfNecessary();

        expect(await GatherGambit.tokenURI(1)).to.not.be.equal(
          "data:application/json;base64,eyJuYW1lIjogIlVucmV2ZWFsZWQgIzEiLCAiZGVzY3JpcHRpb24iOiAiR2F0aGVyIEdhbWJpdCBnYW1lLiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LGFWWkNUMUozTUV0SFoyOUJRVUZCVGxOVmFFVlZaMEZCUVVOQlFVRkJRV2RCWjAxQlFVRkJUMFpLU201QlFVRkJSRVpDVFZaRlZVRkJRVUZ1U25salFVRkJRbFZXUmxSNmRFUTVkMEZCUVVGQldGSlRWR3hOUVZGUFlsbGFaMEZCUVVKV1NsSkZSbFZIVGs1cVIwUjVRVUpqWWxGb1ZFVTBSMEZaWTBGQlFXZExRVUUyYjFCVWNHZDNRVUZCUVVKS1VsVTFSWEpyU21kblp6MDkifQ=="
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
      describe.skip("enterBerryLands()", async function () {
        beforeEach(async function () {
          gathererIndex = 1;
          await mintGatherer();
        });
        describe("FertileFields", async function () {
          it("should revert if not exist", async function () {
            await expect(BerryLands.enterBerryLands(10, 0)).to.be.revertedWith(
              "QueryForNonexistentToken()"
            );
          });
          it("should revert if not approved", async function () {
            await expect(
              BerryLands.enterBerryLands(gathererIndex, 0)
            ).to.be.revertedWith("TransferCallerNotOwnerNorApproved()");
          });
          it("should be successful", async function () {
            await GatherGambit.approve(BerryLands.address, gathererIndex);
            await expect(BerryLands.enterBerryLands(gathererIndex, 0)).to.be
              .fulfilled;
            expect(await GatherGambit.ownerOf(gathererIndex)).to.equal(
              BerryLands.address
            );
          });
        });
        describe("WhisperingWoods", async function () {
          it("should revert if not exist", async function () {
            await expect(BerryLands.enterBerryLands(10, 0)).to.be.revertedWith(
              "QueryForNonexistentToken()"
            );
          });
          it("should revert if not approved", async function () {
            await GatherGambit.mint(contractOwner.address, "1");
            await expect(
              BerryLands.enterBerryLands(gathererIndex, 1)
            ).to.be.revertedWith("TransferCallerNotOwnerNorApproved()");
          });
          it("should be successful", async function () {
            await GatherGambit.approve(BerryLands.address, gathererIndex);
            await expect(BerryLands.enterBerryLands(gathererIndex, 1)).to.be
              .fulfilled;
            expect(await GatherGambit.ownerOf(gathererIndex)).to.equal(
              BerryLands.address
            );
          });
        });
      });
      describe.skip("exitBerryLands()", async function () {
        it("getClaimableBerries()", async function () {
          gathererIndex = 1;
          await mintGatherer();
          await GatherGambit.approve(BerryLands.address, gathererIndex);
          await BerryLands.enterBerryLands(gathererIndex, 0);
          await mine(1);
          expect(
            await BerryLands.getClaimableBerries(gathererIndex, 0)
          ).to.above(BigNumber.from("0"));
        });
        describe("FertileFields", async function () {
          beforeEach(async function () {
            gathererIndex = 1;
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
            const initialBalance = await GatherGambit.balanceOf(
              contractOwner.address
            );
            await expect(BerryLands.exitBerryLands(gathererIndex, 0)).to.be
              .fulfilled;
            expect(
              await GatherGambit.balanceOf(contractOwner.address)
            ).to.be.above(initialBalance);
            expect(await Berries.balanceOf(contractOwner.address)).to.be.above(
              BigNumber.from("0")
            );
            expect(
              (await BerryLands.getStakedGatherer(gathererIndex, 0)).owner
            ).to.be.equal("0x0000000000000000000000000000000000000000");
            expect(await GatherGambit.ownerOf(gathererIndex)).to.equal(
              contractOwner.address
            );
          });
        });
        describe("WhisperingWoods", async function () {
          beforeEach(async function () {
            gathererIndex = 1;
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
            const initialBalance = await GatherGambit.balanceOf(
              contractOwner.address
            );
            await expect(BerryLands.exitBerryLands(gathererIndex, 1)).to.be
              .fulfilled;
            expect(
              await GatherGambit.balanceOf(contractOwner.address)
            ).to.be.above(initialBalance);
            expect(await Berries.balanceOf(contractOwner.address)).to.be.above(
              BigNumber.from("0")
            );
          });
        });
      });
      describe.skip("Protector interaction", async function () {
        describe("FertileFields", async function () {
          beforeEach(async function () {
            gathererIndex = 1;
            await mintGatherer();

            await GatherGambit.approve(BerryLands.address, gathererIndex);
            await BerryLands.enterBerryLands(gathererIndex, 0);
          });
          it("addProtector()", async function () {
            protectorIndex = 1;
            await mintProtector();
            await GatherGambit.approve(BerryLands.address, protectorIndex);
            await BerryLands.addProtector(protectorIndex, gathererIndex, 0);
            expect(
              (await BerryLands.getStakedGatherer(gathererIndex, 0)).protectorId
            ).to.equal(protectorIndex);
            expect(await GatherGambit.ownerOf(protectorIndex)).to.equal(
              BerryLands.address
            );
          });
          it("removeProtector()", async function () {
            protectorIndex = 1;
            await mintProtector();
            await GatherGambit.approve(BerryLands.address, protectorIndex);
            await BerryLands.addProtector(protectorIndex, gathererIndex, 0);
            expect(
              (await BerryLands.getStakedGatherer(gathererIndex, 0)).protectorId
            ).to.equal(protectorIndex);

            await BerryLands.removeProtector(gathererIndex, 0);
            expect(
              (await BerryLands.getStakedGatherer(gathererIndex, 0)).protectorId
            ).to.be.equal("0");
            expect(
              (await BerryLands.getStakedGatherer(gathererIndex, 0)).protectorId
            ).to.equal(0);
            expect(await GatherGambit.ownerOf(protectorIndex)).to.equal(
              contractOwner.address
            );
          });
          it("exit without removing protector", async function () {
            protectorIndex = 1;
            await mintProtector();
            await GatherGambit.approve(BerryLands.address, protectorIndex);
            expect(await GatherGambit.ownerOf(protectorIndex)).to.equal(
              contractOwner.address
            );
            await BerryLands.addProtector(protectorIndex, gathererIndex, 0);
            expect(await GatherGambit.ownerOf(protectorIndex)).to.equal(
              BerryLands.address
            );
            await BerryLands.exitBerryLands(gathererIndex, 0);
            expect(await GatherGambit.ownerOf(protectorIndex)).to.equal(
              contractOwner.address
            );
            await GatherGambit.approve(BerryLands.address, gathererIndex);
            await BerryLands.enterBerryLands(gathererIndex, 0);
            expect(
              (await BerryLands.getStakedGatherer(gathererIndex, 0)).protectorId
            ).to.equal(0);
          });
        });
        describe("WhisperingWoods", async function () {
          beforeEach(async function () {
            gathererIndex = 1;
            await mintGatherer();

            await GatherGambit.approve(BerryLands.address, gathererIndex);
            await BerryLands.enterBerryLands(gathererIndex, 1);
          });
          it("addProtector()", async function () {
            protectorIndex = 1;
            await mintProtector();
            await GatherGambit.approve(BerryLands.address, protectorIndex);
            await BerryLands.addProtector(protectorIndex, gathererIndex, 1);
            expect(
              (await BerryLands.getStakedGatherer(gathererIndex, 1)).protectorId
            ).to.equal(protectorIndex);
            expect(await GatherGambit.ownerOf(protectorIndex)).to.equal(
              BerryLands.address
            );
          });
          it("removeProtector()", async function () {
            protectorIndex = 1;
            await mintProtector();
            await GatherGambit.approve(BerryLands.address, protectorIndex);
            await BerryLands.addProtector(protectorIndex, gathererIndex, 1);
            expect(
              (await BerryLands.getStakedGatherer(gathererIndex, 1)).protectorId
            ).to.equal(protectorIndex);

            await BerryLands.removeProtector(gathererIndex, 1);
            expect(
              (await BerryLands.getStakedGatherer(gathererIndex, 1)).protectorId
            ).to.be.equal("0");
            expect(
              (await BerryLands.getStakedGatherer(gathererIndex, 1)).protectorId
            ).to.equal(0);
            expect(
              (await BerryLands.getStakedGatherer(gathererIndex, 1)).owner
            ).to.be.equal(contractOwner.address);
          });
          it("exit without removing protector", async function () {
            protectorIndex = 1;
            await mintProtector();
            await GatherGambit.approve(BerryLands.address, protectorIndex);
            expect(await GatherGambit.ownerOf(protectorIndex)).to.equal(
              contractOwner.address
            );
            await BerryLands.addProtector(protectorIndex, gathererIndex, 1);
            expect(await GatherGambit.ownerOf(protectorIndex)).to.equal(
              BerryLands.address
            );
            await BerryLands.exitBerryLands(gathererIndex, 1);
            expect(await GatherGambit.ownerOf(protectorIndex)).to.equal(
              contractOwner.address
            );
            await GatherGambit.approve(BerryLands.address, gathererIndex);
            await BerryLands.enterBerryLands(gathererIndex, 1);
            expect(
              (await BerryLands.getStakedGatherer(gathererIndex, 1)).protectorId
            ).to.equal(0);
          });
        });
      });
      describe("Attack", async function () {
        beforeEach(async function () {
          wolfIndex = 1;
          gathererIndex = 1;
          protectorIndex = 1;
          await mintGatherer();
          await mintProtector();
          await mintWolf();
          await GatherGambit.approve(BerryLands.address, gathererIndex);
          await GatherGambit.approve(BerryLands.address, protectorIndex);
          await GatherGambit.approve(BerryLands.address, wolfIndex);
        });
        describe("FertileFields", async function () {
          beforeEach(async function () {
            await BerryLands.enterBerryLands(gathererIndex, 0);
          });
          it("initAttack()", async function () {
            await BerryLands.initiateAttack(wolfIndex, 0);
            expect(await GatherGambit.ownerOf(wolfIndex)).to.equal(
              BerryLands.address
            );
          });
          describe("resolveAttack()", async function () {
            it("shouldn't be able to resolve", async function () {
              await BerryLands.initiateAttack(wolfIndex, 0);
              await expect(
                BerryLands.resolveAttack(wolfIndex)
              ).to.be.revertedWith("AttackNotResolved()");
            });
            it("attack when not protected", async function () {
              await BerryLands.initiateAttack(wolfIndex, 0);
              await mine(55);
              const claimable = await BerryLands.getClaimableBerries(
                gathererIndex,
                0
              );       
              await BerryLands.resolveAttack(wolfIndex);
              expect(
                (await BerryLands.getStakedGatherer(gathererIndex, 0))
                  .claimableBerries
              ).to.be.equal(0);
              expect(await BerryLands.getClaimableBerries(
                gathererIndex,
                0
              )).to.be.below(claimable);
              expect(
                await Berries.balanceOf(contractOwner.address)
              ).to.be.closeTo(claimable, ethers.BigNumber.from("500000000000000000"));
              expect(await GatherGambit.ownerOf(wolfIndex)).to.equal(
                contractOwner.address
              );
            });
            it("attack when protected", async function () {
              await BerryLands.addProtector(protectorIndex, gathererIndex, 0);
              await BerryLands.initiateAttack(wolfIndex, 0);
              await mine(100);
              const claimable = await BerryLands.getClaimableBerries(
                gathererIndex,
                0
              );              
              const stolen = claimable
                .mul(BigNumber.from("4"))
                .div(BigNumber.from("10"));
              let userCut = claimable.sub(stolen);
              await BerryLands.resolveAttack(wolfIndex);
              expect(
                (await BerryLands.getStakedGatherer(gathererIndex, 0))
                  .claimableBerries
              ).to.be.closeTo(userCut, ethers.BigNumber.from("500000000000000000"));
              expect(
                await Berries.balanceOf(contractOwner.address)
              ).to.be.closeTo(stolen, ethers.BigNumber.from("500000000000000000"));;
              expect(await GatherGambit.ownerOf(wolfIndex)).to.equal(
                contractOwner.address
              );
              expect(await BerryLands.getClaimableBerries(
                gathererIndex,
                0
              )).to.be.below(claimable);
            });
          });
        });
        describe("WhisperingWoods", async function () {
          beforeEach(async function () {
            await BerryLands.enterBerryLands(gathererIndex, 1);
          });
          it("initAttack()", async function () {
            await BerryLands.initiateAttack(wolfIndex, 1);
            expect(await GatherGambit.ownerOf(wolfIndex)).to.equal(
              BerryLands.address
            );
          });
          describe("resolveAttack()", async function () {
            it("shouldn't be able to resolve", async function () {
              await BerryLands.initiateAttack(wolfIndex, 1);
              await expect(
                BerryLands.resolveAttack(wolfIndex)
              ).to.be.revertedWith("AttackNotResolved()");
            });
            it("attack when not protected", async function () {
              await BerryLands.initiateAttack(wolfIndex, 1);
              await mine(55);
              const claimable = await BerryLands.getClaimableBerries(
                gathererIndex,
                1
              );              
              await BerryLands.resolveAttack(wolfIndex);
              expect(
                (await BerryLands.getStakedGatherer(gathererIndex, 1))
                  .owner
              ).to.be.equal("0x0000000000000000000000000000000000000000");
              await expect(GatherGambit.ownerOf(gathererIndex)).to.be.revertedWith(
                "OwnerQueryForNonexistentToken()"
              );
              expect(
                await Berries.balanceOf(contractOwner.address)
              ).to.be.closeTo(claimable, ethers.BigNumber.from("500000000000000000"));
              expect(await GatherGambit.ownerOf(wolfIndex)).to.equal(
                contractOwner.address
              );
            });
            it("attack when protected", async function () {
              await BerryLands.addProtector(protectorIndex, gathererIndex, 1);
              await BerryLands.initiateAttack(wolfIndex, 1);
              await mine(100);
              const claimable = await BerryLands.getClaimableBerries(
                gathererIndex,
                1
              );              
              const stolen = claimable
                .mul(BigNumber.from("7"))
                .div(BigNumber.from("10"));
              let userCut = claimable.sub(stolen);
              await BerryLands.resolveAttack(wolfIndex);
              expect(
                (await BerryLands.getStakedGatherer(gathererIndex, 1))
                  .claimableBerries
              ).to.be.closeTo(userCut, ethers.BigNumber.from("500000000000000000"));
              expect(
                await Berries.balanceOf(contractOwner.address)
              ).to.be.closeTo(stolen, ethers.BigNumber.from("500000000000000000"));
              expect(await BerryLands.getClaimableBerries(
                gathererIndex,
                1
              )).to.be.below(claimable);
            });
          });
        });
      });
    });
    describe("SereneSettlements interaction [reproduction]", async function () {

    });
  });
});
