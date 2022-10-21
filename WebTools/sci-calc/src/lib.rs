use wasm_bindgen::prelude::*;
peg::parser! {
  grammar list_parser() for str {
    rule number() -> u32
      = n:$(['0'..='9']+) {? n.parse().or(Err("u32")) }

    rule _ = [' ' | '\n']*

    pub rule list() -> Vec<u32>
      = "max" _ "(" _ l:(number() ** (_ "," _) ) _ ")" { l }
  }
}

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn create() -> Result<u32, JsValue> {
    Ok(0)
}

#[wasm_bindgen]
pub fn destory(_: u32) -> Result<JsValue, JsValue> {
    Ok(true.into())
}
#[wasm_bindgen]
pub async fn run_script(_: u32, source: &str) -> Result<JsValue, JsValue> {
    // let promise = js_sys::Promise::resolve(&format!("Hello, {}!", source).into());
    // let result = wasm_bindgen_futures::JsFuture::from(promise).await?;
    // Ok(result)
    let list = list_parser::list(source);
    match list {
        Ok(res) => Ok(res.into_iter().max().into()),
        Err(err) => Err(err.to_string().into()),
    }
}
