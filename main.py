from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import uuid
import asyncio

from starlette.responses import HTMLResponse

from temp.config import generate_dialogue

app = FastAPI()

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

class CardRequest(BaseModel):
    card_names: list[str]

data_store = {}

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/ask")
async def ask_result(request: CardRequest):
    card_names = request.card_names
    unique_id = str(uuid.uuid4())  # 고유한 UUID 생성
    data_store[unique_id] = {"card_names": card_names, "gpt_response": None}

    # GPT-4 API 호출
    prompt = f"내가 메이저 타로카드를 다음과 같이 뽑았습니다. : {', '.join(card_names)}, 전 남자친구와 재회 할 수 있을까요? 해석을 부탁드립니다."
    try:
        gpt_response = generate_dialogue(prompt)  # 동기 호출

        print(gpt_response)

        # 데이터 저장
        data_store[unique_id]["gpt_response"] = gpt_response
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    await asyncio.sleep(5)  # 5초 동안 비동기 대기

    result_page_url = f'/result-page/{unique_id}'

    return {"result_page_url": result_page_url}

@app.get("/result-page/{unique_id}", response_class=HTMLResponse)
async def result_page(request: Request, unique_id: str):
    data = data_store.get(unique_id, None)
    if data is None:
        raise HTTPException(status_code=404, detail="Data not found")

    card_names = data["card_names"]
    gpt_response = data["gpt_response"]

    # 템플릿 렌더링
    return templates.TemplateResponse("resultPage.html", {"request": request, "card_names": card_names, "gpt_response": gpt_response})