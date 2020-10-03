function diff(arr1, arr2) {
  let arr = [];
  arr1.forEach((obj1) => {
    arr.push(obj1.link);
  });
  return arr2.filter((obj2) => {
    return arr.indexOf(obj2.link) === -1;
  });
}

function newExists(obj1) {
  let exists = false;
  for (const proj in obj1) {
    if (obj1[proj].length) {
      exists = true;
      break;
    }
  }
  return exists;
}

export { diff, newExists };
