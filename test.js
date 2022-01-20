// TEST SOMETHING...

const arrs = [[1, 2, 3], 4, [5, 6], [[7, 8], 9]];

const fn = (arr) => {
  arr.forEach((item) => {
    if (typeof item === "number") {
      console.log(item);
    } else fn(item);
  });
};

fn(arrs);
