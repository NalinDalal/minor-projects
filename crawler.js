"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const downloadFile = (url, outputPath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(url, { responseType: 'arraybuffer' });
        yield fs_extra_1.default.outputFile(outputPath, response.data);
        console.log(`Downloaded: ${url} -> ${outputPath}`);
    }
    catch (error) {
        console.error(`Error downloading ${url}:`, error.message);
    }
});
const crawlPage = (url, outputDir) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch the main HTML
        const { data: html } = yield axios_1.default.get(url);
        const $ = cheerio.load(html);
        // Save the main HTML
        const htmlPath = path_1.default.join(outputDir, 'index.html');
        yield fs_extra_1.default.outputFile(htmlPath, html);
        console.log(`Saved HTML to ${htmlPath}`);
        // Process <script> and <link> tags
        const resourceUrls = [];
        $('script[src], link[rel="stylesheet"]').each((_, elem) => {
            const src = $(elem).attr('src') || $(elem).attr('href');
            if (src) {
                const absoluteUrl = new URL(src, url).href;
                resourceUrls.push(absoluteUrl);
            }
        });
        // Download resources
        for (const resourceUrl of resourceUrls) {
            const fileName = path_1.default.basename(new URL(resourceUrl).pathname);
            const filePath = path_1.default.join(outputDir, fileName);
            yield downloadFile(resourceUrl, filePath);
        }
        console.log(`Crawled and saved resources for ${url}`);
    }
    catch (error) {
        //@ts-ignore
        console.error(`Error crawling ${url}:`, error.message);
    }
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const targetUrl = 'https://github.com/nalindalal'; // Replace with the target URL
    const outputDir = path_1.default.resolve(__dirname, 'output'); // Save files in 'output' folder
    console.log(`Starting crawl for ${targetUrl}`);
    yield crawlPage(targetUrl, outputDir);
    console.log('Crawl complete!');
});
main().catch(console.error);
