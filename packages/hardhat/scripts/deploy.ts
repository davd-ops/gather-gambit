import { ethers } from "hardhat";

async function main() {
  // Berries
  const Berries = await ethers.getContractFactory("Berries");
  const berries = await Berries.deploy();

  await berries.deployed();

  console.log("berries to:", berries.address);

  // GatherGambit
  const GatherGambit = await ethers.getContractFactory("GatherGambit");
  const gatherGambit = await GatherGambit.deploy();

  await gatherGambit.deployed();

  console.log("gatherGambit deployed to:", gatherGambit.address);

  // BerryLands

  const BerryLands = await ethers.getContractFactory("BerryLands");
  const berryLands = await BerryLands.deploy(
    gatherGambit.address,
    berries.address
  );

  await berryLands.deployed();

  console.log("berryLands deployed to:", berryLands.address);

  // SereneSettlements

  const SereneSettlements = await ethers.getContractFactory(
    "SereneSettlements"
  );
  const sereneSettlements = await SereneSettlements.deploy(
    gatherGambit.address,
    berries.address
  );

  await sereneSettlements.deployed();

  console.log("sereneSettlements deployed to:", sereneSettlements.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
