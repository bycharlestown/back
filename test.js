const data1 = [
  {
    name: "John",
    age: "18",
    description: [],
  },
  {
    name: "Mark",
    age: "20",
    description: [],
  },
  {
    name: "Peter",
    age: "15",
    description: [],
  },
];

const data2 = { sex: "MALE", family: "FULL" };

async function getData1() {
  const infos = await getData2();

  console.log("DATA 2: ", infos);

  for await (const data of data1) {
    data.description.push(infos);
  }

  console.log(data1[0].description);
}

async function getData2() {
  return Promise.resolve(data2).then((x) => {
    console.log("getData2(): ", x);
    return x;
  });
}

getData1();
