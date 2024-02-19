import * as fs from 'fs';
import { savePoint } from './saveData.js';

const apartmentsNames = [ '11-A001', '11-A006', '11-A010', '11-A014', '11-A018', '11-A022', '11-A026', '11-A030' ]


async function getPage(url) {


return fetch(url, {
  "headers": {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest",
    "x-wp-lang": "pl",
    "x-wp-nonce": "30a7f41236",
    "cookie": "CookieConsent={stamp:%27lJ38GcJTUtmmNBwxdqm8QYzV32GNzffbcKnMAzdgqAsdL6FOgn03+g==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cmethod:%27explicit%27%2Cver:1%2Cutc:1707746031464%2Cregion:%27pl%27}; language=pl; yltrack=true; ylid=browserId=38622949-f63b-66c3-dfcf-8fa5b56c0d4e; ylp=1; ylwp=0; _hjSessionUser_3327618=eyJpZCI6ImRmYTczYWJiLWI3MTctNWNhNS04YjgyLTg0OWVkZTNiYzNhNCIsImNyZWF0ZWQiOjE3MDc3NDYwMzM2NTUsImV4aXN0aW5nIjp0cnVlfQ==; ylutm=utmcsr=google|utmccn=(not set)|utmcmd=organic|utmctr=(not provided)|utmcct=(not set); _hjSession_3327618=eyJpZCI6IjllZmI3NmNkLTk1YTgtNGUwMS05YWU0LTU1YjdkNTk5YTQ2ZiIsImMiOjE3MDgwODY2MDkzODUsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MH0=; ylssid=sessionId=be1b540c-b560-b420-8f23-b6fb650f78d0; yldp-popup3=a=0|b=0|c=0|d=false|e=1708137371838; yldyn=a=67|b=19",
    "Referer": "https://ronson.pl/ursus-centralny/szukaj-mieszkania/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": "city=warszawa&district=ursus&investment%5B%5D=ursus-centralny&stage=&sort=&rooms%5B%5D=1&rooms%5B%5D=7&floor%5B%5D=0&floor%5B%5D=7&area%5B%5D=10&area%5B%5D=100&type=&mdm=&entresol=&promo=&complete=",
  "method": "POST"
});
};

async function fetchData() {
        let url = 'https://ronson.pl/api/apartments/search?page=1'
	const apartments = [];
        let lastPage = false;
        let total;
	do {
         const response = await getPage(url)        
	 const { data, meta }  = await response.json();
         data.forEach( item => apartments.push(item));
         console.log(meta);
         lastPage = meta.current_page !== meta.last_page; 
         console.log(lastPage);
	 url = meta.next_page_url;
 	 total = meta.total;

	} while (lastPage)
//        console.log(apartments);	
        const prices = apartments.reduce((result, apartment)  => ({ ...result, [apartment.name]: { price: apartment.brutto, display: apartment.display }}), {})
	console.log(prices);
        const now = new Date(Date.now());
	const date = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`
        const dataToStore = apartmentsNames.map(name => prices[name].display ? prices[name].price : 'Do not display').join(',');
        fs.appendFileSync('ronson.csv',`${date},${total},${dataToStore}\n`);
	apartments.filter(apartment => apartment.brutto != null).forEach(async apartment =>  
            await savePoint(apartment.name, apartment.display, apartment.brutto));
}


fetchData()
