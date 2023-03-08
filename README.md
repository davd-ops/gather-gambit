URL - https://gather-gambit-next-app.vercel.app/

## Inspiration

We were inspired by famous web3 projects that implemented game theory principles as the first ones in this field - PixelVault, WolfGame and also others who implemented PvP mechanics like ChainArena, breeding mechanics like ZedRun and many other innovators like EtherOrgs. Also we were very excited about Loot Project which allowed community to build on top of it, and newest innovator Checks from Jack Butcher which brought up new interesting slow-reveal concept. We’re here for all of that!

## What it does

Gather Gambit is an on-chain NFT game with live in-game economy. The game starts when the first NFT is minted. It is randomly decided (we’re using precautions to stay fully on-chain without external dependencies like oracles, but still ensuring the randomization won’t be gamed) if the NFT will become Gatherer, Protector, or a Wolf. Each of them have different roles in the ecosystem. Gatherer collects $BERRIES (erc-20 token) or reproduce for more in-game characters, Protector is used to Gatherers while collecting and Wolves are able to steal collected resources. The framework is very easy to undestand. The fun starts after players are comfortable in initial game setting and are ready to dive deeper into the game theory behind it. Each location where Gatherers can collect introduces different risk/rewards mechanics for both Gatherers & Wolves. Adding a protector will also hugely tweak this dynamic. Can players guess what the counterpart will do? And what is the best EV play? The meta will change throughout the game base on player behavior. However, these interesting mechanics are only the shallow pond, compared to the sea of possibilities. The architecture allows to be built onto (not only by authors but also by the community) and introduce many more mechanics, use-cases and concepts!

## How we built it

Everything regarding game logic & economy is fully on-chain, 100% transparent and playable straight from Etherscan, we used Solidity to build the contracts. However UX is very important for us and therefore we’re launching with a frontend UI that will allow holders to do all actions within comfortable and intuitive environment, built in NextJs and Typescript.

## Challenges we ran into

Making anything on-chain without any external dependencies is quite challenging on it’s own. But when you want to also introduce random chances while not using any oracles or other external sources, you’re left with quite a hard task. Thankfully we were able to solve this.

## Accomplishments that we're proud of

Implementation of Commit-Resolve mechanic by MouseDev, while utilizing prevrandao (new solidity opcode) to make our game safe and commit-resolve based.

Overall ecocystem simplicity for users to understand while keeping it very exciting for the ones that want to make calculations and dive deeper.

Clean readable code that will make it easy to iterate or build on top of current smart contracts and openness of this ecosystem.

## What we learned

We learned a lot about oracles while trying to avoid them to make sure the game stays live as long as ethereum is live, learned about commit-resolve system and it’s implementation and also about prevrandao opcode introduced in the newest solidity version.

## What's next for Gather Gambit

What’s next? More advanced UI, more in-game options, more $BERRIES usecases, more gametheory!

### Fantom mainnet Deployed contracts

- Berries: https://ftmscan.com/address/0xC8Cc303BFaF3F07e13a32C402177735ccE8D3e0C

- GatherGambit: https://ftmscan.com/address/0x5d1e1189800d1A312d4e7c77A5202dC8BB1e0123

- BerryLands: https://ftmscan.com/address/0x3AD95b3CE46a17169eE040448fE50515a0011330

- SereneSettlements: https://ftmscan.com/address/0x01c35804e99a0F064B06b3559baA2DE9f7Ee262D
