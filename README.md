# 8주차 테스트 과제
## (1) 요구사항 추가

### 1) 기본 요구사항

<aside>
💡 현재 App.tsx는 7주차 과제의 요구사항이 그대로 적용된 상태입니다.

</aside>

1. 일정을 생성, 조회, 수정, 삭제할 수 있어야 한다. 이를 통해 내 일정을 효과적으로 관리할 수 있다.
2. 일정의 제목, 날짜, 시작 시간, 종료 시간, 설명, 위치를 지정할 수 있어야 한다. 이를 통해 각 일정에 대한 상세 정보를 기록하고 확인할 수 있다.
3. 주별 또는 월별로 일정을 볼 수 있어야 한다. 이를 통해 특정 기간의 일정을 한눈에 파악할 수 있다.
4. 일정에 태그나 카테고리를 지정할 수 있어야 한다. 이를 통해 일정을 체계적으로 구분하고 관리할 수 있다.
5. 일정에 대한 알림을 설정할 수 있어야 한다. 이를 통해 중요한 일정을 잊지 않고 준비할 수 있다.
6. 일정을 검색할 수 있어야 한다. 이를 통해 특정 일정을 빠르게 찾을 수 있다.
7. 달력에 공휴일 정보가 표시되는 것을 볼 수 있어야 한다. 이를 통해 공휴일을 고려하여 일정을 계획할 수 있다.
8. 일정 간 겹침이 있을 경우 경고를 받아야 한다. 이를 통해 일정 충돌을 사전에 방지하고 조정할 수 있다.

### 2) 반복 일정에 대한 요구사항 추가

반복 일정에 대한 요구사항이 추가됩니다.

> **서버 친구들이 반복일정에 대한 구현을 하지 않고 휴가에 갔어요!
대신 리스트에 대한 create, update, delete API는 제공해준다고 하니 로직은 FE에서 알아고 하라고 하네요. 🤬**
>

### **server.js를 아래 코드로 복붙해서 수정하세요!**

```jsx
import { randomUUID } from 'crypto';
import fs from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

import express from 'express';

const app = express();
const port = 3000;
const __dirname = path.resolve();

app.use(express.json());

const getEvents = async () => {
  const data = await readFile(`${__dirname}/src/__mocks__/response/realEvents.json`, 'utf8');

  return JSON.parse(data);
};

app.get('/api/events', async (_, res) => {
  const events = await getEvents();
  res.json(events);
});

app.post('/api/events', async (req, res) => {
  const events = await getEvents();
  const newEvent = { id: randomUUID(), ...req.body };

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/realEvents.json`,
    JSON.stringify({
      events: [...events.events, newEvent],
    })
  );

  res.status(201).json(newEvent);
});

app.put('/api/events/:id', async (req, res) => {
  const events = await getEvents();
  const id = req.params.id;
  const eventIndex = events.events.findIndex((event) => event.id === id);
  if (eventIndex > -1) {
    const newEvents = [...events.events];
    newEvents[eventIndex] = { ...events.events[eventIndex], ...req.body };

    fs.writeFileSync(
      `${__dirname}/src/__mocks__/response/realEvents.json`,
      JSON.stringify({
        events: newEvents,
      })
    );

    res.json(events.events[eventIndex]);
  } else {
    res.status(404).send('Event not found');
  }
});

app.delete('/api/events/:id', async (req, res) => {
  const events = await getEvents();
  const id = req.params.id;

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/realEvents.json`,
    JSON.stringify({
      events: events.events.filter((event) => event.id !== id),
    })
  );

  res.status(204).send();
});

app.post('/api/events-list', async (req, res) => {
  const events = await getEvents();
  const repeatId = randomUUID();
  const newEvents = req.body.events.map((event) => {
    const isRepeatEvent = event.repeat.type !== 'none';
    return {
      id: randomUUID(),
      ...event,
      repeat: {
        ...event.repeat,
        id: isRepeatEvent ? repeatId : undefined,
      },
    };
  });

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/realEvents.json`,
    JSON.stringify({
      events: [...events.events, ...newEvents],
    })
  );

  res.status(201).json(newEvents);
});
	
app.put('/api/events-list', async (req, res) => {
  const events = await getEvents();
  let isUpdated = false;

  const newEvents = [...events.events];
  req.body.events.forEach((event) => {
    const eventIndex = events.events.findIndex((target) => target.id === event.id);
    if (eventIndex > -1) {
      isUpdated = true;
      newEvents[eventIndex] = { ...events.events[eventIndex], ...event };
    }
  });

  if (isUpdated) {
    fs.writeFileSync(
      `${__dirname}/src/__mocks__/response/realEvents.json`,
      JSON.stringify({
        events: newEvents,
      })
    );

    res.json(events.events);
  } else {
    res.status(404).send('Event not found');
  }
});

app.delete('/api/events-list', async (req, res) => {
  const events = await getEvents();
  const newEvents = events.events.filter((event) => !req.body.eventIds.includes(event.id)); // ? ids를 전달하면 해당 아이디를 기준으로 events에서 제거

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/realEvents.json`,
    JSON.stringify({
      events: newEvents,
    })
  );

  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

```

1. **(필수) 반복 유형 선택**
    - 일정 생성 또는 수정 시 반복 유형을 선택할 수 있다.
    - 반복 유형은 다음과 같다: 매일, 매주, 매월, 매년
        - 만약, 윤년 29일에 또는 31일에 매월 또는 매년 반복일정을 설정한다면 어떻게 처리할까요? 다른 서비스를 참고해보시고 자유롭게 작성해보세요.
2. **(필수) 반복 간격 설정**
    - 각 반복 유형에 대해 간격을 설정할 수 있다.
    - 예: 2일마다, 3주마다, 2개월마다 등
3. **(필수) 반복 일정 표시**
    - 캘린더 뷰에서 반복 일정을 시각적으로 구분하여 표시한다.
        - 아이콘을 넣든 태그를 넣든 자유롭게 해보세요!
4. **(필수) 반복 종료**
    - 반복 종료 조건을 지정할 수 있다.
    - 옵션: 특정 날짜까지, 특정 횟수만큼, 또는 종료 없음 (예제 특성상, 2025-06-30까지)
5. **(필수) 반복 일정 단일 수정**
    - 반복일정을 수정하면 단일 일정으로 변경됩니다.
    - 반복일정 아이콘도 사라집니다.
6. **(필수)**  **반복 일정 단일 삭제**
    - 반복일정을 삭제하면 해당 일정만 삭제합니다.
7. 예외 날짜 처리:
    - 반복 일정 중 특정 날짜를 제외할 수 있다.
    - 반복 일정 중 특정 날짜의 일정을 수정할 수 있다.
8. 요일 지정 (주간 반복의 경우):
    - 주간 반복 시 특정 요일을 선택할 수 있다.
9. 월간 반복 옵션:
    - 매월 특정 날짜에 반복되도록 설정할 수 있다.
    - 매월 특정 순서의 요일에 반복되도록 설정할 수 있다.
10. 반복 일정 전체 수정 및 삭제
    - 반복 일정의 모든 일정을 수정할 수 있다.
    - 반복 일정의 모든 일정을 삭제할 수 있다.

학습을 위해 최대한 많은 요구사항을 언급했습니다. **과제 평가는 필수 요구사항에 대해서만 이루어질 예정**이고, 스스로 더 많은 내용을 추가하고 싶으면 나머지 요구사항(7 ~ 10)을 참고해주세요.

7~10은 자유롭게 UI를 추가할 수 있습니다.

### 3) 요구사항에 대한 시나리오 (참고용)

<aside>
💡 시나리오는 추가된 요구사항을 더 잘 이해하기 위한 장치입니다. 과제를 진행하면서 참고해주세요.

</aside>

1. 사용자 김항해는 매주 월요일 오전 10시에 있는 팀 회의를 캘린더에 등록하려고 한다.
2. 김항해는 새 일정 추가 버튼을 클릭하고 다음과 같이 정보를 입력한다:
    - 제목: "주간 팀 회의"
    - 날짜: 2024년 7월 1일 (월요일)
    - 시작 시간: 오전 10:00
    - 종료 시간: 오전 11:00
    - 위치: "회의실 A"
    - 설명: "주간 업무 보고 및 계획 수립"
3. 반복 설정에서 "매주"를 선택하고, 반복 간격을 1주로 설정한다.
4. 요일 선택에서 "월요일"을 선택한다.
5. 반복 종료 조건으로 "종료일 지정"을 선택하고, 2024년 12월 31일로 설정한다.
6. 알림 설정을 "10분 전"으로 선택한다.
7. 일정을 저장하면, 캘린더에 2024년 7월 1일부터 12월 30일까지 매주 월요일마다 해당 회의가 표시된다.
8. 9월부터 회의 시간이 30분 연장되어, 김철수는 9월 이후의 모든 회의 시간을 수정하려고 한다.
9. 9월 2일 일정을 선택하고 "이후 모든 일정 수정" 옵션을 선택한 후, 종료 시간을 오전 11:30으로 변경한다.
10. 변경 사항을 저장하면, 9월 2일부터 12월 30일까지의 모든 회의 일정이 10:00-11:30으로 업데이트된다.
11. 9월 셋째 주 월요일이 공휴일(2024년 9월 16일, 추석)이라는 것을 알게 된 김철수는 해당 날짜의 회의를 취소하려고 한다.
12. 9월 16일 일정을 선택하고 "이 일정만 삭제" 옵션을 선택하여 해당 날짜의 회의만 취소한다.

이 시나리오는 반복 일정 생성, 예외 처리, 부분 수정 및 전체 수정 등 여러 요구사항을 포함하고 있어, 각 기능의 구체적인 동작을 이해하는 데 도움이 될 것입니다. 이를 바탕으로 TDD 방식의 테스트 케이스를 작성할 수 있을 것 같습니다.

## (2) TDD 기반으로 코드 작성하기

<aside>
💡 main 브랜치를 기준으로 코드를 작성해도 좋고, **이전 주차에 제출한 코드를 기반으로 작성해도 무방합니다.**

</aside>

아래의 순서를 기반으로 코드를 작성해주세요. 모든 요구사항을 기반으로 작성하지 않아도 좋습니다.

1. 추가된 요구사항에 대해 실패하는 테스트 코드를 작성합니다.
2. 추가된 요구사항에 대해 성공하는 테스트 코드를 작성합니다.
3. 테스트 코드를 통과할 수 있도록 구현 코드(어플리케이션 코드)를 작성합니다.
4. 1~3을 리팩토링합니다.

![tdd.png](./public/tdd.png)

# 3. 평가 기준

1. TDD 프로세스 준수:
    - 테스트를 먼저 작성하고 실패하는 것을 확인한 후 구현을 진행했는가?
    - 각 요구사항에 대해 최소한의 코드로 테스트를 통과시켰는가?
    - 테스트 통과 후 적절한 리팩토링을 수행했는가?
2. 테스트 품질:
    - 각 테스트가 하나의 동작 또는 기능만을 명확히 검증하고 있는가?
    - 테스트가 요구사항을 정확히 반영하고 있는가?
    - 모든 주요 기능과 시나리오(긍정적 케이스와 부정적 케이스 모두)에 대한 테스트가 작성되었는가?
    - 경계값과 예외 상황에 대한 테스트가 포함되어 있는가?