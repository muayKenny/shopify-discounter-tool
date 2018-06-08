
const Shopify = require('shopify-api-node');

const nicl = require('nicl');

const shopifyConfigs = {
    shopifyUS: {
        shopName: 'US-store',
        apiKey: 'xxxxxxxxx',
        password: 'xxxxxxxxx'
    },
    shopifyEU: {
        shopName: 'EU-store',
        apiKey: 'xxxxxxxxx',
        password: 'xxxxxxxxx'
    }
}

const main = () => {
    //console interface using nicl
    //main is called by "nicl.run(main);" at bottom of page 
    let input = {};
    input.currencyValues = {};
    console.log('\x1b[1m%s\x1b[0m', "Welcome to Discount Code Creator");
    console.log('\x1b[7m%s\x1b[0m', "Enter Discount Code Title for all sites");
    input.title = nicl.readLine();

    nicl.printLine("Enter Start Date in format: '01 Jan 2018 00:00:00'")
    input.startDate = nicl.readLine();
    input.startDate = new Date(input.startDate);
    dateCheck(input.startDate)
    nicl.printLine("Enter End Date in format: '01 Jan 2018 00:00:00'")
    input.endDate = nicl.readLine();
    input.endDate = new Date(input.endDate)
    dateCheck(input.endDate)
    nicl.printLine("If you don't want to post a code to a currency simply hit enter")
    nicl.printLine("Enter USD discount value")
    input.currencyValues.usd = nicl.readLine();
    nicl.printLine("Enter EU discount value")
    input.currencyValues.eur = nicl.readLine();
    nicl.printLine("Enter UK discount value")
    input.currencyValues.gbp = nicl.readLine();
    nicl.printLine("Enter AU discount value")
    input.currencyValues.aud = nicl.readLine();
    nicl.printLine("Enter CAD discount value")
    input.currencyValues.cad = nicl.readLine();
    checkIfInt(input.currencyValues);

    nicl.printLine(input)
    nicl.printLine("any currencies marked as 'null' will not have codes created")
    nicl.printLine("is this correct? y/n")
    let finalInput = nicl.readLine();
    if (finalInput === 'y' || 'Y') {
        console.log('initiating discount creations')
        processUserInput(input);
    } else {
        process.exit(0);
    }

}
const checkIfInt = (currencyValues) => {
    Object.keys(currencyValues).forEach(key => {
        currencyValues[key] = parseInt(currencyValues[key]);
        if (isNaN(currencyValues[key])) {
            currencyValues[key] = null;
        } else {
            currencyValues[key] = -currencyValues[key]
        }
    });
}

function dateCheck(inputDate) {
    inputDate = new Date(inputDate);
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (inputDate < yesterday) {
        console.error('\x1b[31m%s\x1b[0m', 'input date is invalid');
        console.error('\x1b[31m%s\x1b[0m', "Date entered must be greater than yesterday's date");
        process.exit(0);
    }
}

const processUserInput = (input) => {

    let price_rule = {
        "target_type": "line_item",
        "target_selection": "entitled",
        "allocation_method": "each",
        "value_type": "fixed_amount",
        "once_per_customer": false,
        "customer_selection": "all",
        "value": "",
        "starts_at": "",
        "ends_at": ""
    }
    price_rule.title = input.title;
    price_rule.starts_at = input.startDate;
    price_rule.ends_at = input.endDate;

    let discount_code = {
        "code": ""
    }
    discount_code.code = input.title;

    for (let money in input.currencyValues) {
        if (input.currencyValues[money]) {
            if (money == 'usd') {
                let shopifyUSConfig = { ...shopifyConfigs.shopifyUS };
                let price_ruleUS = {
                    ...price_rule,
                    entitled_product_ids: ['xxxxxxx'],
                    value: input.currencyValues.usd
                }
                discountCodeSequence(shopifyUSConfig, price_ruleUS, discount_code);
            }
            if (money == 'eur') {
                let shopifyEUConfig = { ...shopifyConfigs.shopifyEU };
                let price_ruleEU = {
                    ...price_rule,
                    entitled_product_ids: ['xxxxxxx'],
                    value: input.currencyValues.eur
                }
                discountCodeSequence(shopifyEUConfig, price_ruleEU, discount_code);
            }
            if (money == 'gpb') {
                console.log('gpb bad')
            }
            if (money == 'aud') {
                console.log('aud bad')
            }
            if (money == 'cad') {
                console.log('cad bad')
            }
        }
    }

}

const discountCodeSequence = async (config, price_rule, discount_code) => {
    try {
        const shopify = new Shopify({
            shopName: config.shopName,
            apiKey: config.apiKey,
            password: config.password
        });
        const postedPriceRule = await shopify.priceRule.create(price_rule)
        const postedDiscountCode = await shopify.discountCode.create(postedPriceRule.id, discount_code)
        console.log('\x1b[36m%s\x1b[0m', 'Confirming post for ' + config.shopName)
        console.log('\x1b[36m%s\x1b[0m', 'Discount Code ' + postedDiscountCode.code + ' posted for' + postedPriceRule.value + ' off')
        console.log('')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'error at post to: ' + err.hostname)
        console.error('\x1b[31m%s\x1b[0m', 'post: ' + err.path)
        console.error('\x1b[31m%s\x1b[0m', 'error: ' + err.statusCode)
        console.error('\x1b[31m%s\x1b[0m', err.statusMessage)
        console.error('')
    }
}

nicl.run(main);




