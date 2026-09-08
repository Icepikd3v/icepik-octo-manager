import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.IS_REACT_ACT_ENVIRONMENT = true;

window.scrollTo = jest.fn();
Element.prototype.scrollIntoView = jest.fn();
