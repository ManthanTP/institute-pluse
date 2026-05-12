var M;(function(t){t.STRING="string",t.NUMBER="number",t.INTEGER="integer",t.BOOLEAN="boolean",t.ARRAY="array",t.OBJECT="object"})(M||(M={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var k;(function(t){t.LANGUAGE_UNSPECIFIED="language_unspecified",t.PYTHON="python"})(k||(k={}));var x;(function(t){t.OUTCOME_UNSPECIFIED="outcome_unspecified",t.OUTCOME_OK="outcome_ok",t.OUTCOME_FAILED="outcome_failed",t.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded"})(x||(x={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const L=["user","model","function","system"];var G;(function(t){t.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",t.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",t.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",t.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",t.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT",t.HARM_CATEGORY_CIVIC_INTEGRITY="HARM_CATEGORY_CIVIC_INTEGRITY"})(G||(G={}));var D;(function(t){t.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",t.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",t.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",t.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",t.BLOCK_NONE="BLOCK_NONE"})(D||(D={}));var $;(function(t){t.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",t.NEGLIGIBLE="NEGLIGIBLE",t.LOW="LOW",t.MEDIUM="MEDIUM",t.HIGH="HIGH"})($||($={}));var F;(function(t){t.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",t.SAFETY="SAFETY",t.OTHER="OTHER"})(F||(F={}));var v;(function(t){t.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",t.STOP="STOP",t.MAX_TOKENS="MAX_TOKENS",t.SAFETY="SAFETY",t.RECITATION="RECITATION",t.LANGUAGE="LANGUAGE",t.BLOCKLIST="BLOCKLIST",t.PROHIBITED_CONTENT="PROHIBITED_CONTENT",t.SPII="SPII",t.MALFORMED_FUNCTION_CALL="MALFORMED_FUNCTION_CALL",t.OTHER="OTHER"})(v||(v={}));var U;(function(t){t.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",t.RETRIEVAL_QUERY="RETRIEVAL_QUERY",t.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",t.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",t.CLASSIFICATION="CLASSIFICATION",t.CLUSTERING="CLUSTERING"})(U||(U={}));var H;(function(t){t.MODE_UNSPECIFIED="MODE_UNSPECIFIED",t.AUTO="AUTO",t.ANY="ANY",t.NONE="NONE"})(H||(H={}));var P;(function(t){t.MODE_UNSPECIFIED="MODE_UNSPECIFIED",t.MODE_DYNAMIC="MODE_DYNAMIC"})(P||(P={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class l extends Error{constructor(e){super(`[GoogleGenerativeAI Error]: ${e}`)}}class m extends l{constructor(e,n){super(e),this.response=n}}class X extends l{constructor(e,n,s,o){super(e),this.status=n,this.statusText=s,this.errorDetails=o}}class C extends l{}class Q extends l{}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const et="https://generativelanguage.googleapis.com",nt="v1beta",st="0.24.1",ot="genai-js";var _;(function(t){t.GENERATE_CONTENT="generateContent",t.STREAM_GENERATE_CONTENT="streamGenerateContent",t.COUNT_TOKENS="countTokens",t.EMBED_CONTENT="embedContent",t.BATCH_EMBED_CONTENTS="batchEmbedContents"})(_||(_={}));class it{constructor(e,n,s,o,i){this.model=e,this.task=n,this.apiKey=s,this.stream=o,this.requestOptions=i}toString(){var e,n;const s=((e=this.requestOptions)===null||e===void 0?void 0:e.apiVersion)||nt;let i=`${((n=this.requestOptions)===null||n===void 0?void 0:n.baseUrl)||et}/${s}/${this.model}:${this.task}`;return this.stream&&(i+="?alt=sse"),i}}function at(t){const e=[];return t!=null&&t.apiClient&&e.push(t.apiClient),e.push(`${ot}/${st}`),e.join(" ")}async function rt(t){var e;const n=new Headers;n.append("Content-Type","application/json"),n.append("x-goog-api-client",at(t.requestOptions)),n.append("x-goog-api-key",t.apiKey);let s=(e=t.requestOptions)===null||e===void 0?void 0:e.customHeaders;if(s){if(!(s instanceof Headers))try{s=new Headers(s)}catch(o){throw new C(`unable to convert customHeaders value ${JSON.stringify(s)} to Headers: ${o.message}`)}for(const[o,i]of s.entries()){if(o==="x-goog-api-key")throw new C(`Cannot set reserved header name ${o}`);if(o==="x-goog-api-client")throw new C(`Header name ${o} can only be set using the apiClient field`);n.append(o,i)}}return n}async function ct(t,e,n,s,o,i){const a=new it(t,e,n,s,i);return{url:a.toString(),fetchOptions:Object.assign(Object.assign({},ft(i)),{method:"POST",headers:await rt(a),body:o})}}async function R(t,e,n,s,o,i={},a=fetch){const{url:r,fetchOptions:c}=await ct(t,e,n,s,o,i);return dt(r,c,a)}async function dt(t,e,n=fetch){let s;try{s=await n(t,e)}catch(o){ut(o,t)}return s.ok||await lt(s,t),s}function ut(t,e){let n=t;throw n.name==="AbortError"?(n=new Q(`Request aborted when fetching ${e.toString()}: ${t.message}`),n.stack=t.stack):t instanceof X||t instanceof C||(n=new l(`Error fetching from ${e.toString()}: ${t.message}`),n.stack=t.stack),n}async function lt(t,e){let n="",s;try{const o=await t.json();n=o.error.message,o.error.details&&(n+=` ${JSON.stringify(o.error.details)}`,s=o.error.details)}catch{}throw new X(`Error fetching from ${e.toString()}: [${t.status} ${t.statusText}] ${n}`,t.status,t.statusText,s)}function ft(t){const e={};if((t==null?void 0:t.signal)!==void 0||(t==null?void 0:t.timeout)>=0){const n=new AbortController;(t==null?void 0:t.timeout)>=0&&setTimeout(()=>n.abort(),t.timeout),t!=null&&t.signal&&t.signal.addEventListener("abort",()=>{n.abort()}),e.signal=n.signal}return e}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function b(t){return t.text=()=>{if(t.candidates&&t.candidates.length>0){if(t.candidates.length>1&&console.warn(`This response had ${t.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),A(t.candidates[0]))throw new m(`${E(t)}`,t);return ht(t)}else if(t.promptFeedback)throw new m(`Text not available. ${E(t)}`,t);return""},t.functionCall=()=>{if(t.candidates&&t.candidates.length>0){if(t.candidates.length>1&&console.warn(`This response had ${t.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),A(t.candidates[0]))throw new m(`${E(t)}`,t);return console.warn("response.functionCall() is deprecated. Use response.functionCalls() instead."),Y(t)[0]}else if(t.promptFeedback)throw new m(`Function call not available. ${E(t)}`,t)},t.functionCalls=()=>{if(t.candidates&&t.candidates.length>0){if(t.candidates.length>1&&console.warn(`This response had ${t.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),A(t.candidates[0]))throw new m(`${E(t)}`,t);return Y(t)}else if(t.promptFeedback)throw new m(`Function call not available. ${E(t)}`,t)},t}function ht(t){var e,n,s,o;const i=[];if(!((n=(e=t.candidates)===null||e===void 0?void 0:e[0].content)===null||n===void 0)&&n.parts)for(const a of(o=(s=t.candidates)===null||s===void 0?void 0:s[0].content)===null||o===void 0?void 0:o.parts)a.text&&i.push(a.text),a.executableCode&&i.push("\n```"+a.executableCode.language+`
`+a.executableCode.code+"\n```\n"),a.codeExecutionResult&&i.push("\n```\n"+a.codeExecutionResult.output+"\n```\n");return i.length>0?i.join(""):""}function Y(t){var e,n,s,o;const i=[];if(!((n=(e=t.candidates)===null||e===void 0?void 0:e[0].content)===null||n===void 0)&&n.parts)for(const a of(o=(s=t.candidates)===null||s===void 0?void 0:s[0].content)===null||o===void 0?void 0:o.parts)a.functionCall&&i.push(a.functionCall);if(i.length>0)return i}const gt=[v.RECITATION,v.SAFETY,v.LANGUAGE];function A(t){return!!t.finishReason&&gt.includes(t.finishReason)}function E(t){var e,n,s;let o="";if((!t.candidates||t.candidates.length===0)&&t.promptFeedback)o+="Response was blocked",!((e=t.promptFeedback)===null||e===void 0)&&e.blockReason&&(o+=` due to ${t.promptFeedback.blockReason}`),!((n=t.promptFeedback)===null||n===void 0)&&n.blockReasonMessage&&(o+=`: ${t.promptFeedback.blockReasonMessage}`);else if(!((s=t.candidates)===null||s===void 0)&&s[0]){const i=t.candidates[0];A(i)&&(o+=`Candidate was blocked due to ${i.finishReason}`,i.finishMessage&&(o+=`: ${i.finishMessage}`))}return o}function O(t){return this instanceof O?(this.v=t,this):new O(t)}function Et(t,e,n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var s=n.apply(t,e||[]),o,i=[];return o={},a("next"),a("throw"),a("return"),o[Symbol.asyncIterator]=function(){return this},o;function a(u){s[u]&&(o[u]=function(d){return new Promise(function(f,y){i.push([u,d,f,y])>1||r(u,d)})})}function r(u,d){try{c(s[u](d))}catch(f){g(i[0][3],f)}}function c(u){u.value instanceof O?Promise.resolve(u.value.v).then(h,p):g(i[0][2],u)}function h(u){r("next",u)}function p(u){r("throw",u)}function g(u,d){u(d),i.shift(),i.length&&r(i[0][0],i[0][1])}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const j=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function Ct(t){const e=t.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),n=yt(e),[s,o]=n.tee();return{stream:_t(s),response:pt(o)}}async function pt(t){const e=[],n=t.getReader();for(;;){const{done:s,value:o}=await n.read();if(s)return b(mt(e));e.push(o)}}function _t(t){return Et(this,arguments,function*(){const n=t.getReader();for(;;){const{value:s,done:o}=yield O(n.read());if(o)break;yield yield O(b(s))}})}function yt(t){const e=t.getReader();return new ReadableStream({start(s){let o="";return i();function i(){return e.read().then(({value:a,done:r})=>{if(r){if(o.trim()){s.error(new l("Failed to parse stream"));return}s.close();return}o+=a;let c=o.match(j),h;for(;c;){try{h=JSON.parse(c[1])}catch{s.error(new l(`Error parsing JSON response: "${c[1]}"`));return}s.enqueue(h),o=o.substring(c[0].length),c=o.match(j)}return i()}).catch(a=>{let r=a;throw r.stack=a.stack,r.name==="AbortError"?r=new Q("Request aborted when reading from the stream"):r=new l("Error reading from the stream"),r})}}})}function mt(t){const e=t[t.length-1],n={promptFeedback:e==null?void 0:e.promptFeedback};for(const s of t){if(s.candidates){let o=0;for(const i of s.candidates)if(n.candidates||(n.candidates=[]),n.candidates[o]||(n.candidates[o]={index:o}),n.candidates[o].citationMetadata=i.citationMetadata,n.candidates[o].groundingMetadata=i.groundingMetadata,n.candidates[o].finishReason=i.finishReason,n.candidates[o].finishMessage=i.finishMessage,n.candidates[o].safetyRatings=i.safetyRatings,i.content&&i.content.parts){n.candidates[o].content||(n.candidates[o].content={role:i.content.role||"user",parts:[]});const a={};for(const r of i.content.parts)r.text&&(a.text=r.text),r.functionCall&&(a.functionCall=r.functionCall),r.executableCode&&(a.executableCode=r.executableCode),r.codeExecutionResult&&(a.codeExecutionResult=r.codeExecutionResult),Object.keys(a).length===0&&(a.text=""),n.candidates[o].content.parts.push(a)}o++}s.usageMetadata&&(n.usageMetadata=s.usageMetadata)}return n}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function z(t,e,n,s){const o=await R(e,_.STREAM_GENERATE_CONTENT,t,!0,JSON.stringify(n),s);return Ct(o)}async function Z(t,e,n,s){const i=await(await R(e,_.GENERATE_CONTENT,t,!1,JSON.stringify(n),s)).json();return{response:b(i)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tt(t){if(t!=null){if(typeof t=="string")return{role:"system",parts:[{text:t}]};if(t.text)return{role:"system",parts:[t]};if(t.parts)return t.role?t:{role:"system",parts:t.parts}}}function I(t){let e=[];if(typeof t=="string")e=[{text:t}];else for(const n of t)typeof n=="string"?e.push({text:n}):e.push(n);return vt(e)}function vt(t){const e={role:"user",parts:[]},n={role:"function",parts:[]};let s=!1,o=!1;for(const i of t)"functionResponse"in i?(n.parts.push(i),o=!0):(e.parts.push(i),s=!0);if(s&&o)throw new l("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");if(!s&&!o)throw new l("No content is provided for sending chat message.");return s?e:n}function Ot(t,e){var n;let s={model:e==null?void 0:e.model,generationConfig:e==null?void 0:e.generationConfig,safetySettings:e==null?void 0:e.safetySettings,tools:e==null?void 0:e.tools,toolConfig:e==null?void 0:e.toolConfig,systemInstruction:e==null?void 0:e.systemInstruction,cachedContent:(n=e==null?void 0:e.cachedContent)===null||n===void 0?void 0:n.name,contents:[]};const o=t.generateContentRequest!=null;if(t.contents){if(o)throw new C("CountTokensRequest must have one of contents or generateContentRequest, not both.");s.contents=t.contents}else if(o)s=Object.assign(Object.assign({},s),t.generateContentRequest);else{const i=I(t);s.contents=[i]}return{generateContentRequest:s}}function K(t){let e;return t.contents?e=t:e={contents:[I(t)]},t.systemInstruction&&(e.systemInstruction=tt(t.systemInstruction)),e}function It(t){return typeof t=="string"||Array.isArray(t)?{content:I(t)}:t}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const B=["text","inlineData","functionCall","functionResponse","executableCode","codeExecutionResult"],Rt={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","executableCode","codeExecutionResult"],system:["text"]};function At(t){let e=!1;for(const n of t){const{role:s,parts:o}=n;if(!e&&s!=="user")throw new l(`First content should be with role 'user', got ${s}`);if(!L.includes(s))throw new l(`Each item should include role field. Got ${s} but valid roles are: ${JSON.stringify(L)}`);if(!Array.isArray(o))throw new l("Content should have 'parts' property with an array of Parts");if(o.length===0)throw new l("Each Content should have at least one part");const i={text:0,inlineData:0,functionCall:0,functionResponse:0,fileData:0,executableCode:0,codeExecutionResult:0};for(const r of o)for(const c of B)c in r&&(i[c]+=1);const a=Rt[s];for(const r of B)if(!a.includes(r)&&i[r]>0)throw new l(`Content with role '${s}' can't contain '${r}' part`);e=!0}}function q(t){var e;if(t.candidates===void 0||t.candidates.length===0)return!1;const n=(e=t.candidates[0])===null||e===void 0?void 0:e.content;if(n===void 0||n.parts===void 0||n.parts.length===0)return!1;for(const s of n.parts)if(s===void 0||Object.keys(s).length===0||s.text!==void 0&&s.text==="")return!1;return!0}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V="SILENT_ERROR";class St{constructor(e,n,s,o={}){this.model=n,this.params=s,this._requestOptions=o,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=e,s!=null&&s.history&&(At(s.history),this._history=s.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(e,n={}){var s,o,i,a,r,c;await this._sendPromise;const h=I(e),p={safetySettings:(s=this.params)===null||s===void 0?void 0:s.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(i=this.params)===null||i===void 0?void 0:i.tools,toolConfig:(a=this.params)===null||a===void 0?void 0:a.toolConfig,systemInstruction:(r=this.params)===null||r===void 0?void 0:r.systemInstruction,cachedContent:(c=this.params)===null||c===void 0?void 0:c.cachedContent,contents:[...this._history,h]},g=Object.assign(Object.assign({},this._requestOptions),n);let u;return this._sendPromise=this._sendPromise.then(()=>Z(this._apiKey,this.model,p,g)).then(d=>{var f;if(q(d.response)){this._history.push(h);const y=Object.assign({parts:[],role:"model"},(f=d.response.candidates)===null||f===void 0?void 0:f[0].content);this._history.push(y)}else{const y=E(d.response);y&&console.warn(`sendMessage() was unsuccessful. ${y}. Inspect response object for details.`)}u=d}).catch(d=>{throw this._sendPromise=Promise.resolve(),d}),await this._sendPromise,u}async sendMessageStream(e,n={}){var s,o,i,a,r,c;await this._sendPromise;const h=I(e),p={safetySettings:(s=this.params)===null||s===void 0?void 0:s.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(i=this.params)===null||i===void 0?void 0:i.tools,toolConfig:(a=this.params)===null||a===void 0?void 0:a.toolConfig,systemInstruction:(r=this.params)===null||r===void 0?void 0:r.systemInstruction,cachedContent:(c=this.params)===null||c===void 0?void 0:c.cachedContent,contents:[...this._history,h]},g=Object.assign(Object.assign({},this._requestOptions),n),u=z(this._apiKey,this.model,p,g);return this._sendPromise=this._sendPromise.then(()=>u).catch(d=>{throw new Error(V)}).then(d=>d.response).then(d=>{if(q(d)){this._history.push(h);const f=Object.assign({},d.candidates[0].content);f.role||(f.role="model"),this._history.push(f)}else{const f=E(d);f&&console.warn(`sendMessageStream() was unsuccessful. ${f}. Inspect response object for details.`)}}).catch(d=>{d.message!==V&&console.error(d)}),u}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Nt(t,e,n,s){return(await R(e,_.COUNT_TOKENS,t,!1,JSON.stringify(n),s)).json()}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wt(t,e,n,s){return(await R(e,_.EMBED_CONTENT,t,!1,JSON.stringify(n),s)).json()}async function Tt(t,e,n,s){const o=n.requests.map(a=>Object.assign(Object.assign({},a),{model:e}));return(await R(e,_.BATCH_EMBED_CONTENTS,t,!1,JSON.stringify({requests:o}),s)).json()}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class J{constructor(e,n,s={}){this.apiKey=e,this._requestOptions=s,n.model.includes("/")?this.model=n.model:this.model=`models/${n.model}`,this.generationConfig=n.generationConfig||{},this.safetySettings=n.safetySettings||[],this.tools=n.tools,this.toolConfig=n.toolConfig,this.systemInstruction=tt(n.systemInstruction),this.cachedContent=n.cachedContent}async generateContent(e,n={}){var s;const o=K(e),i=Object.assign(Object.assign({},this._requestOptions),n);return Z(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(s=this.cachedContent)===null||s===void 0?void 0:s.name},o),i)}async generateContentStream(e,n={}){var s;const o=K(e),i=Object.assign(Object.assign({},this._requestOptions),n);return z(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(s=this.cachedContent)===null||s===void 0?void 0:s.name},o),i)}startChat(e){var n;return new St(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(n=this.cachedContent)===null||n===void 0?void 0:n.name},e),this._requestOptions)}async countTokens(e,n={}){const s=Ot(e,{model:this.model,generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:this.cachedContent}),o=Object.assign(Object.assign({},this._requestOptions),n);return Nt(this.apiKey,this.model,s,o)}async embedContent(e,n={}){const s=It(e),o=Object.assign(Object.assign({},this._requestOptions),n);return wt(this.apiKey,this.model,s,o)}async batchEmbedContents(e,n={}){const s=Object.assign(Object.assign({},this._requestOptions),n);return Tt(this.apiKey,this.model,e,s)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bt{constructor(e){this.apiKey=e}getGenerativeModel(e,n){if(!e.model)throw new l("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new J(this.apiKey,e,n)}getGenerativeModelFromCachedContent(e,n,s){if(!e.name)throw new C("Cached content must contain a `name` field.");if(!e.model)throw new C("Cached content must contain a `model` field.");const o=["model","systemInstruction"];for(const a of o)if(n!=null&&n[a]&&e[a]&&(n==null?void 0:n[a])!==e[a]){if(a==="model"){const r=n.model.startsWith("models/")?n.model.replace("models/",""):n.model,c=e.model.startsWith("models/")?e.model.replace("models/",""):e.model;if(r===c)continue}throw new C(`Different value for "${a}" specified in modelParams (${n[a]}) and cachedContent (${e[a]})`)}const i=Object.assign(Object.assign({},n),{model:e.model,tools:e.tools,toolConfig:e.toolConfig,systemInstruction:e.systemInstruction,cachedContent:e});return new J(this.apiKey,i,s)}}const Mt="AIzaSyB706-NnARFT8PsjJKTR8J9AbyRri6_rNA";let N=null,W=null;function S(){return N||(N=new bt(Mt),W=N.getGenerativeModel({model:"gemini-1.5-flash"})),W}async function kt(t){var n,s,o,i,a,r;const e=S();if(!e)return w(t);try{const c=`You are a campus sustainability advisor for InstitutePulse.
Analyze this student's carbon footprint data and give 3 concise, actionable, specific tips.
Format as a JSON array of strings. Be encouraging and specific.

Carbon data today:
- Transport: ${(n=t.transport_kg)==null?void 0:n.toFixed(2)} kg CO2
- Electricity: ${(s=t.electricity_kg)==null?void 0:s.toFixed(2)} kg CO2
- Food: ${(o=t.food_kg)==null?void 0:o.toFixed(2)} kg CO2
- Water: ${(i=t.water_kg)==null?void 0:i.toFixed(2)} kg CO2
- Waste: ${(a=t.waste_kg)==null?void 0:a.toFixed(2)} kg CO2
- Total: ${(r=t.total_kg)==null?void 0:r.toFixed(2)} kg CO2
- Eco Score: ${t.eco_score}/100

Respond with ONLY a JSON array like: ["tip1", "tip2", "tip3"]`,g=(await e.generateContent(c)).response.text().match(/\[[\s\S]*\]/);return g?JSON.parse(g[0]):w(t)}catch(c){return console.error("Gemini error:",c),w(t)}}function w(t){const e=[],{transport_kg:n,food_kg:s,electricity_kg:o}=t;return n>.5?e.push("🚌 Consider taking the college bus tomorrow — it saves ~0.36 kg CO2 compared to a motorbike for a 5km commute!"):e.push("🚲 Great transport choices today! Keep using eco-friendly modes to earn more eco-points."),s>2?e.push("🥗 Replacing one non-veg meal with vegetarian saves ~1 kg CO2 per day — try it tomorrow!"):e.push("🌱 Your food choices are eco-friendly! Vegan meals have the lowest carbon footprint."),o>1?e.push("💡 Reduce AC usage by 1 hour to save ~1.23 kg CO2. Setting AC to 24°C instead of 20°C cuts electricity CO2 by 30%."):e.push("⚡ Excellent energy usage today! Remember to switch off devices when not in use."),e}async function xt({subjects:t,daily_hours:e}){const n=S();if(!n)return T(t,e);try{const s=`You are an academic study planner. Create a 7-day study schedule.
Subjects: ${JSON.stringify(t)}
Daily study hours available: ${e}

Return ONLY a JSON object like:
{
  "week": [
    {"day": "Monday", "date": "Day 1", "tasks": [{"subject": "Math", "topic": "Calculus", "hours": 2}]},
    ...7 days total
  ]
}`,a=(await n.generateContent(s)).response.text().match(/\{[\s\S]*\}/);return a?JSON.parse(a[0]):T(t,e)}catch(s){return console.error("Gemini study plan error:",s),T(t,e)}}function T(t,e){const n=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],s=t!=null&&t.length?t:["Mathematics","Physics","Chemistry"],o=Math.floor((e||3)/s.length)||1;return{week:n.map((i,a)=>({day:i,date:`Day ${a+1}`,tasks:s.map((r,c)=>({subject:r,topic:`Chapter ${a+1} - Core Concepts`,hours:o}))}))}}async function Lt(t){const e=S();if(!e)return"Hi! I'm InstitutePulse AI Assistant. I'm currently running in offline mode. Please configure your Gemini API key for full AI capabilities. In the meantime, I can tell you that: Taking the college bus saves ~0.36 kg CO2 per 5km vs motorbike. Vegetarian meals save ~1 kg CO2 vs non-veg. Logging daily earns you eco-points and badges! 🌿";try{const s=e.startChat({systemInstruction:`You are InstitutePulse — a Smart Campus Sustainability Assistant.
You know about:
- Carbon footprint tracking (transport, food, electricity, water, waste)
- Campus bus routes and eco-benefits of public transport
- Cafeteria menu and low-carbon food choices
- QR attendance and paperless systems
- Eco-points, badges, leaderboards, and green challenges
- Study planning and academic support
- Campus sustainability initiatives

Key facts:
- College bus: 0.048 kg CO2/km (vs motorbike 0.120 kg CO2/km)
- Campus budget: 5 kg CO2/day per student
- Eco score 90-100 = Excellent (Eco Champion)
- Log daily for streak bonuses and badges

Be concise, helpful, eco-aware, and encouraging. Use emojis occasionally.`,history:t.slice(0,-1).map(a=>({role:a.role==="user"?"user":"model",parts:[{text:a.content}]}))}),o=t[t.length-1];return(await s.sendMessage(o.content)).response.text()}catch(n){return console.error("Gemini chat error:",n),"I encountered an issue connecting to the AI service. Please check your API key configuration. 🌿"}}async function Gt(t,e){const n=S();if(!n)return`📚 **${t} Lab Assistant**

I'm in offline mode. Please configure your Gemini API key for full AI lab assistance.

For your question: "${e}"

I recommend consulting your lab manual and textbook. Remember: digital learning saves paper and earns you eco-points! 🌱`;try{const s=`You are a virtual lab assistant for ${t}.
Help students understand experiments, procedures, and prepare for viva examinations.
Be clear, structured, and educational.

Student question: ${e}

Provide a helpful, structured response.`;return(await n.generateContent(s)).response.text()}catch(s){return console.error("Gemini lab assistant error:",s),"I encountered an issue. Please try again. 🌿"}}export{xt as a,Gt as b,Lt as c,kt as g};
