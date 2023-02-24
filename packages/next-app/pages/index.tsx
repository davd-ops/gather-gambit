import { ConnectKitButton } from 'connectkit';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <>
      <div
        style={{
          display: 'flex',
          paddingTop: '25px',
          justifyContent: 'right',
        }}
      >
        <ConnectKitButton />
      </div>
      <p className='mt-8 text-center text-2xl'>LET'S GAME BEGIN</p>
      <div className='mx-auto mt-8 max-w-4xl space-y-8 px-2 '>
        <p>
          Gather and Breeder were two unlikely companions in the vast jungle,
          thrown together by circumstance and the need to survive. Gather was a
          skilled forager, able to find fruits, nuts, and roots in the thick
          undergrowth, while Breeder was an expert in animal husbandry, able to
          tame and breed wild creatures for food and companionship.
        </p>
        <p>
          Despite their differences, they worked together seamlessly, each
          relying on the other to provide for their basic needs. They built a
          small shelter out of woven branches and leaves, and spent their days
          exploring the jungle, gathering food and resources, and tending to
          their growing collection of animals.
        </p>
        <p>
          But as they delved deeper into the jungle, they discovered that they
          were not alone. Strange and fearsome creatures prowled the underbrush
          at night, their glowing eyes and sharp teeth glinting in the darkness.
          Gather and Breeder quickly learned to stay close to their shelter
          after dark, huddling together for safety as the creatures prowled
          outside.
        </p>
        <p>
          As they became more accustomed to the dangers of the jungle, Gather
          and Breeder began to explore further afield, venturing into uncharted
          territory and encountering new and wondrous creatures at every turn.
          They marveled at the sight of giant insects, shimmering lizards, and
          massive, lumbering beasts that seemed to shake the very ground beneath
          their feet.
        </p>

        <p>
          Despite the dangers, Gather and Breeder felt alive in the jungle,
          surrounded by the raw energy and beauty of the natural world. They
          knew that they were only at the beginning of their journey, and that
          there were endless wonders and terrors to be discovered in this vast
          and untamed land.
        </p>

        <p>
          As they settled down for the night, huddled together in their shelter,
          Gather and Breeder looked out at the stars and dreamed of the
          adventures that awaited them in the days and weeks to come. They knew
          that they had only just scratched the surface of this new world, and
          that they were destined to become the first explorers of a land that
          had never been seen or touched by human hands before. continues.......
        </p>
      </div>
    </>
  );
};

export default Home;
