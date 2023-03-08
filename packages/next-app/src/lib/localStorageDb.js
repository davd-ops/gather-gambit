// // @params event can be Attack,

// export const setLocalStorageDb = ({ tokenId, address, event, location }) => {
//   let items = JSON.parse(localStorage.getItem(event));
//   let newItems = JSON.stringify({
//     tokenId,
//     address,
//     location,
//   });
//   if (items) {
//     items.push(newItems);
//     localStorage.setItem(event, JSON.stringify(items));
//   } else {
//     localStorage.setItem(event, newItems);
//   }
// };

// export const getLocaleStorageDb = ({ address, event }) => {
//   let items = JSON.parse(localStorage.getItem(event));
//   console.log(items);
//   let a = items.filter((item) => item.address === address);

//   console.log(a);

//   return items[0];
// };

export const setLocalStorageDb = ({
  tokenId,
  address,
  event,
  location,
  arr,
} = {}) => {
  if (arr) {
    let items = getLocaleStorageDb({ event: event });
    if (items) localStorage.setItem(event, JSON.stringify([...items, ...arr]));
  }
  let items = JSON.parse(localStorage.getItem(event));
  let newItems = {
    tokenId,
    address,
    location,
  };
  if (items) {
    items.push(newItems);
    localStorage.setItem(event, JSON.stringify(items));
  } else {
    localStorage.setItem(event, JSON.stringify([newItems]));
  }
};

export const getLocaleStorageDb = ({ event } = {}) => {
  let items = JSON.parse(localStorage.getItem(event));
  if (!items) return;
  return items;
};
