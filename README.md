# JaehoGames.github.io
1. index.html - 메인 HTML 구조

기본적인 HTML 마크업
필요한 CSS, JS 파일들을 링크

2. styles.css - 스타일시트

전체 레이아웃 및 디자인
등급별 색상 정의
복잡한 CSS 애니메이션들 (가챠박스, 등급 효과, 폭죽 등)

3. gameData.js - 게임 데이터

grades 객체 (등급별 확률, 색상, 이미지 정보)
stats 객체 (통계 데이터)

4. gacha.js - 가챠 핵심 로직

getRandomGrade() - 확률에 따른 등급 선택
getRandomImage() - 등급별 랜덤 이미지 선택
createFallbackImage() - 이미지 로드 실패시 대체 이미지 생성
pullGacha() - 메인 가챠 뽑기 함수

5. effects.js - 특수 효과

createFireworks() - 폭죽 효과 생성
applySpecialEffects() - 등급별 화면 효과 (섬광, 배경 변경 등)

6. utils.js - 유틸리티 함수들

URL 저장/로드 기능
통계 표시 업데이트
게임 초기화
공유 링크 복사 및 모달

7. main.js - 초기화 및 이벤트 핸들러

페이지 로드시 초기화
키보드 이벤트 (스페이스바, 엔터키로 뽑기)
모바일 터치 최적화
디버그 함수들 (window.debugGacha)
