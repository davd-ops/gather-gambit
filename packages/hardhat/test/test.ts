import { BigNumber, Signer } from "ethers";
import { CERC20 } from "../typechain-types/index";
import CERC20Artifact from "../artifacts/contracts/CERC20.sol/CERC20.json";
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
let CERC20: CERC20;

describe("Initialization of core functions", function () {
  beforeEach(async function () {
    [user, contractOwner] = await ethers.getSigners();

    CERC20 = (await deployContract(contractOwner, CERC20Artifact)) as CERC20;

    CERC20 = (await deployContract(contractOwner, CERC20Artifact)) as CERC20;
  });

  describe("ForeverPP Contract", function () {
    describe("General Stuff", function () {
      it("should have proper owner", async function () {
        expect(await CERC20.owner()).to.equal(contractOwner.address);
      });
      it("should have proper name", async function () {
        expect(await CERC20.name()).to.equal("Custom ERC20");
      });
      it("should have proper symbol", async function () {
        expect(await CERC20.symbol()).to.equal("CERC20");
      });

      it("should support ERC20 interface", async function () {
        expect(await CERC20.supportsInterface("0x01ffc9a7")).to.equal(true);
      });
    });
  });
});
