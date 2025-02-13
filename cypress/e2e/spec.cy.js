describe('필수 기능 테스트', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  after(() => {
    cy.request('POST', 'http://localhost:3000/api/reset-events');
  });

  const getInputByLabel = (labelText) =>
    cy
      .contains('label', labelText)
      .invoke('attr', 'for')
      .then((id) => cy.get(`[id="${id}"]`));

  it('일정 생성 폼 입력', () => {
    getInputByLabel('제목').type('테스트 일정');
    getInputByLabel('날짜').type('2025-02-13');
    getInputByLabel('시작 시간').type('10:00');
    getInputByLabel('종료 시간').type('11:00');
    getInputByLabel('설명').type('테스트 일정 설명');
    cy.get('label').contains('반복 일정').click();
    cy.get('button').contains('일정 추가').click();
  });

  it('일정 수정 아이콘 클릭', () => {
    cy.get('[data-testid=event-list]')
      .find('button')
      .get('[aria-label="Edit event"]')
      .last()
      .click();
    getInputByLabel('제목').clear().type('수정된 테스트 일정');
    cy.get('button').contains('일정 수정').click();
  });

  it('일정 삭제 아이콘 클릭', () => {
    cy.get('[data-testid=event-list]')
      .find('button')
      .get('[aria-label="Delete event"]')
      .last()
      .click();
  });

  it('주간 뷰 확인', () => {
    cy.get('[aria-label="view"]').select('Week');
    cy.get('[data-testid=week-view]').should('not.contain', '팀 회의');
  });

  it('월간 뷰 확인', () => {
    cy.get('[aria-label="view"]').select('Month');
    cy.get('[data-testid=month-view]').should('contain', '팀 회의');

    cy.get('[aria-label="Previous"]').click();
    cy.get('[data-testid=month-view]').should('not.contain', '팀 회의');
  });

  it('일정 겹침 => 모달창 표시', () => {
    getInputByLabel('제목').type('겹치는 팀 회의');
    getInputByLabel('날짜').type('2025-02-20');
    getInputByLabel('시작 시간').type('10:00');
    getInputByLabel('종료 시간').type('11:00');
    getInputByLabel('설명').type('테스트 일정 설명');
    cy.get('label').contains('반복 일정').click();
    cy.get('button').contains('일정 추가').click();

    cy.get('header')
      .contains(/일정 겹침 경고/)
      .should('exist');
    cy.get('button').contains('계속 진행').click();

    cy.get('[data-testid="event-list"]')
      .should('contain', '겹치는 팀 회의')
      .and('contain', '팀 회의');
  });

  it('반복 일정 표시 확인', () => {
    getInputByLabel('제목').type('반복 팀 회의');
    getInputByLabel('날짜').type('2025-02-17');
    getInputByLabel('시작 시간').type('10:00');
    getInputByLabel('종료 시간').type('11:00');
    getInputByLabel('설명').type('반복 테스트 일정 설명');
    getInputByLabel('반복 유형').select('weekly').select('daily');
    cy.get('label').contains('반복 종료일').type('2025-02-19');
    cy.get('button').contains('일정 추가').click();
  });

  it('반복 일정 수정', () => {
    cy.get('[data-testid=event-list]')
      .find('button')
      .get('[aria-label="Edit event"]')
      .last()
      .click();
    getInputByLabel('제목').clear().type('수정된 반복 팀 회의');
    getInputByLabel('시작 시간').clear().type('11:00');
    getInputByLabel('종료 시간').clear().type('12:00');
    cy.get('button').contains('일정 수정').click();
  });
});
