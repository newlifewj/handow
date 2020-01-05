"use strict";

const Given = null;
const When = null;
const Then = null;
const page = null;
let config;

const expect = require('expect');
const fs = require('fs');
const deepExtend = require('deep-extend');

// 'page' and 'config' will be injected in run time

Given("I reset local storage", async (selector) => {
    await fs.writeFile();
});

When("I wait it {selector} is displayed", async (selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
});

When("I click button {selector}", async (selector) => {
    const button = await page.waitForXPath(selector, { visible: true, timeout: config.elementAppearTimeout });
    page.evaluate( el => el.click(), button );
    // button.click();
});


// It is just an alias of "I wait it (selector) is displayed"
Given("I have seen it {selector} is displayed", async (selector) => {
    await page.waitForSelector(selector, { visible: true, timeout: config.elementAppearTimeout });
});

Given("I have seen it {xpath} is displayed", async (xpath) => {
    await page.waitForXPath(xpath, { visible: true, timeout: config.elementAppearTimeout });
});

Given("I have opened url {url}", async (url) => {
    await page.goto(url);
});

Then("I can see it {selector} is showing html {html}", async (selector, html) => {
    const _html = await page.$eval(selector, (el) => el.innerHTML);
    expect(_html).toBe(html);
});

Then("I can see it {selector} is showing content {content}", async (selector, content) => {
    const _text = await page.$eval(selector, (el) => el.innerText);
    expect(_text).toBe(content);
});

When("I move mouse hover on it {selector}", async (selector) => {
    // await page.hover(selector);
    // hover the element first matched
    const element = await page.$(selector);
    await element.hover();
});

When("I move mouse hover on it {xpath}", async (xpath) => {
    const elements = await page.$x(xpath);
    await elements[0].hover();
});

