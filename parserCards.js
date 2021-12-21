/*  Если вы не понимаете что здесь происходит,
то исходники кода можно найти здесь: 
https://www.youtube.com/watch?v=dljI-PgYSek&t=8s*/

import ax from "axios";
const { get } = ax;
import chee from "cheerio";
const { load } = chee;
import fs from "fs";

const cardsInfo = [];

function numFromStr(str) {
  let prices = str.split("—").map((s) => s.replace(/\D/g, ""));
  return prices.join(" — ");
}

const writeFile = (cardsInfo) => {
  fs.writeFile(
    "./cardsInfo.json",

    `${JSON.stringify(cardsInfo, null, 2)}`,
    (err) => {
      if (err) throw err;
      console.log("Data has been replaced!");
    }
  );
};

////////////////////////////////////////////////////////////////////

// CARDS PARSING
const parseFranchiseInfo = async (url, category) => {
  try {
    // В этот массив попадают объекты сформированные в цикле
    const getHTML = async (url) => {
      try {
        const { data } = await get(url);

        return load(data);
      } catch (error) {
        console.log("ERR GET HTML: ", error);
      }
    };

    const $ = await getHTML(`${url}`);

    const pageNumber = $("li.pagination-line__item").eq(-2).text();

    for (let currentPage = 1; currentPage <= pageNumber; currentPage++) {
      const selector = await getHTML(`${url}-p-${currentPage}`);

      selector(".tdb-view__item").each(async (i, element) => {
        // На каждой итерации создается объект с данными о франшизе
        ///////////////////////////////////////////////////////////////////////////////////
        // CARDS DESCRIPTION PARSING
        const parseDescription = async (url) => {
          try {
            // В этот массив попадают объекты сформированные в цикле
            const getHTML = async (url) => {
              try {
                const { data } = await get(url);

                return load(data);
              } catch (error) {
                console.log(error);
              }
            };

            const $ = await getHTML(`${url}`);

            const selector = await getHTML(`${url}`);

            let franchiseData = [];

            selector(".fr-page").each(async (i, el) => {
              const promise = await new Promise((resolve, reject) => {
                return resolve({
                  priceFranchise: selector(el)
                    .find(".fr-page__price-inner")
                    .html(),
                  mainInfo: selector(el)
                    .find(".fr-page__basic-info-box")
                    .html(),
                  companyDescr: selector(el).find("#company_descr_tpl").html(),
                  franchDescr: selector(el).find("#franch_descr_tpl").html(),
                  supportDescr: selector(el).find("#support_descr").html(),
                  buyersRequirements: selector(el)
                    .find("#buyers_requirements_tpl")
                    .html(),
                  quartersRequirements: selector(el)
                    .find("#quarters_requirements_tpl")
                    .html(),
                });
              });

              const promiseResult = await promise;

              franchiseData.push(promiseResult);
            });

            return franchiseData;
          } catch (error) {
            console.log(error);
          }
        };

        ///////////////////////////////////////////////////////////////////////////////////////////
        const promiseInfo = await new Promise(async (resolve, reject) => {
          return resolve({
            image: selector(element)
              .find("img.tdb-view__picture")
              .attr("src")
              .endsWith(".jpg")
              ? `https://www.beboss.ru${selector(element)
                  .find("img.tdb-view__picture")
                  .attr("src")}`
              : `${selector(element)
                  .find("img.tdb-view__picture")
                  .attr("src")}`,
            title: selector(element).find("h3.tdb-view__text").text(),
            description: selector(element)
              .find("span.fr-card-list__description")
              .text(),
            price: numFromStr(
              selector(element)
                .find("p.fr-card-list__price > span:nth-child(2)")
                .text()
            ),
            category: category,
            // link: selector(element).find("a.stretched-link").attr("href"),
            fullDescription: await parseDescription(
              selector(element).find(".stretched-link").attr("href")
            ),
          });
        });

        const promiseInfoResult = await promiseInfo;

        cardsInfo.push(promiseInfoResult);
      });
    }
    // console.log(cardsInfo[0]); // Checking output
    return cardsInfo;
  } catch (error) {
    console.log(error);
  }
};

// parseFranchiseInfo(`https://www.beboss.ru/franchise/search-c-auto`, "auto");

Promise.all(
  // Можно оптимизировать и убрать 15 вызовов если спарсить ссылки и получать их автоматически
  [parseFranchiseInfo(`https://www.beboss.ru/franchise/search-c-auto`, "auto")]
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-children`,
  //   "children"
  // ),
  // parseFranchiseInfo(`https://www.beboss.ru/franchise/search-c-it`, "it"),
  // parseFranchiseInfo(`https://www.beboss.ru/franchise/search-c-health`, "health"),
  // parseFranchiseInfo(`https://www.beboss.ru/franchise/search-c-study`, "study"),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-entertainment`,
  //   "entertainment"
  // ),
  // parseFranchiseInfo(`https://www.beboss.ru/franchise/search-c-food`, "food"),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-production`,
  //   "production"
  // ),
  // parseFranchiseInfo(`https://www.beboss.ru/franchise/search-c-retail`, "retail"),
  // parseFranchiseInfo(`https://www.beboss.ru/franchise/search-c-beauty`, "beauty"),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-construction`,
  //   "construction"
  // ),
  // parseFranchiseInfo(`https://www.beboss.ru/franchise/search-c-b2b-services`, "b2b"),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-services`,
  //   "services"
  // ),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-finances`,
  //   "finances"
  // ),
).then(() => {
  writeFile(cardsInfo);
});
