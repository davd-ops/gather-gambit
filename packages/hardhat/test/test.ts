import { BigNumber, Signer } from "ethers";
import { Berries, GatherGambit } from "../typechain-types/index";
import BerriesArtifact from "../artifacts/contracts/Berries.sol/Berries.json";
import GatherGambitArtifact from "../artifacts/contracts/GatherGambit.sol/GatherGambit.json";
import { ethers, waffle } from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const { deployContract } = waffle;
const { expect } = chai;
chai.use(chaiAsPromised);
let user: SignerWithAddress;
let contractOwner: SignerWithAddress;
let random: SignerWithAddress;
let Berries: Berries;
let GatherGambit: GatherGambit;

describe("Initialization of core functions", function () {
  beforeEach(async function () {
    [user, contractOwner] = await ethers.getSigners();

    Berries = (await deployContract(contractOwner, BerriesArtifact)) as Berries;

    GatherGambit = (await deployContract(contractOwner, GatherGambitArtifact)) as GatherGambit;
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
      it("should mint 1000000000000000000000000000 BERRIES to owner", async function () {
        expect(await Berries.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("0")
        );
        await Berries.mint(
          contractOwner.address,
          "1000000000000000000000000000"
        );
        expect(await Berries.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("1000000000000000000000000000")
        );
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
        await GatherGambit.mint(
          contractOwner.address,
          "10"
        );
        expect(await GatherGambit.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("10")
        );
      });
      it("burn()", async function () {
        await GatherGambit.mint(
          contractOwner.address,
          "10"
        );
        await GatherGambit.burn("0");
        expect(await GatherGambit.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("9")
        );
      });
      it("not approved burn()", async function () {
        await GatherGambit.mint(
          contractOwner.address,
          "10"
        );
        await expect (GatherGambit.connect(user).burn("0")).to.be.revertedWith('TransferCallerNotOwnerNorApproved()');
        expect(await GatherGambit.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("10")
        );
      });
      it("burnBatch()", async function () {
        await GatherGambit.mint(
          contractOwner.address,
          "10"
        );
        await GatherGambit.burnBatch([0,1,2,3,4,5,6,7,8,9]);
        expect(await GatherGambit.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("0")
        );
      })
      it("not approved burnBatch()", async function () {
        await GatherGambit.mint(
          contractOwner.address,
          "10"
        );
        await expect (GatherGambit.connect(user).burnBatch([0,1,2,3,4,5,6,7,8,9])).to.be.revertedWith('TransferCallerNotOwnerNorApproved()');
        expect(await GatherGambit.balanceOf(contractOwner.address)).to.equal(
          BigNumber.from("10")
        );
      })
      it("resolveEpochIfNecessary()", async function () {
        await GatherGambit.resolveEpochIfNecessary();
        expect(await GatherGambit.getcurrentEpochIndex()).to.equal(BigNumber.from("0"));
      });
      it("getEntity()", async function () {
        await GatherGambit.mint(
          contractOwner.address,
          "10"
        );
        expect(await GatherGambit.getEntity(0)).to.equal(BigNumber.from("0"));
      });
        it("tokenURI()", async function () {
        await expect(GatherGambit.tokenURI(0)).to.be.revertedWith('QueryForNonexistentToken()');
        await GatherGambit.mint(
          contractOwner.address,
          "1"
        );
       console.log( await GatherGambit.tokenURI(0));
      });
      it("should support 721 interface", async function () {
        expect(await GatherGambit.supportsInterface("0x80ac58cd")).to.equal(true);
      });
    });
  });
});
