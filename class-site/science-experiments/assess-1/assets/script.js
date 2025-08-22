// 과학탐구실험 수행평가 1차 JavaScript

// 우수 작품 보기 기능
function showExcellentWorks() {
    const modal = createModal('우수 작품 갤러리', `
        <div class="excellent-works">
            <div class="work-item">
                <h4>김○○ 학생 작품</h4>
                <p>온도별 용해도 변화를 정확히 측정하고, 분자 운동론으로 현상을 설명한 우수한 보고서</p>
                <div class="score">점수: 95점</div>
            </div>
            <div class="work-item">
                <h4>이○○ 학생 작품</h4>
                <p>창의적인 실험 설계와 다양한 변인 통제를 통한 정밀한 데이터 수집</p>
                <div class="score">점수: 93점</div>
            </div>
            <div class="work-item">
                <h4>박○○ 학생 작품</h4>
                <p>실험 결과를 바탕으로 한 추가 탐구 활동과 실생활 적용 방안 제시</p>
                <div class="score">점수: 92점</div>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
}

// 피드백 보기 기능
function showFeedback() {
    const modal = createModal('전체 피드백', `
        <div class="feedback-content">
            <div class="feedback-section">
                <h4>👍 잘한 점</h4>
                <ul>
                    <li>대부분의 학생들이 실험 과정을 체계적으로 기록했습니다</li>
                    <li>데이터 수집과 그래프 작성이 정확했습니다</li>
                    <li>안전 수칙을 잘 준수하며 실험했습니다</li>
                </ul>
            </div>
            <div class="feedback-section">
                <h4>📝 개선할 점</h4>
                <ul>
                    <li>결론 부분에서 과학적 원리 설명이 부족한 경우가 있었습니다</li>
                    <li>오차 분석과 개선 방안 제시가 미흡했습니다</li>
                    <li>실험 변인 통제에 대한 이해가 더 필요합니다</li>
                </ul>
            </div>
            <div class="feedback-section">
                <h4>📚 다음 활동을 위한 조언</h4>
                <ul>
                    <li>가설 설정 시 과학적 근거를 명확히 제시하세요</li>
                    <li>실험 결과를 다양한 관점에서 분석해보세요</li>
                    <li>실생활과의 연관성을 찾아 설명해보세요</li>
                </ul>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
}

// 모달 생성 함수
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    // 모달 스타일 추가
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background-color: white;
                border-radius: 10px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e9ecef;
                background: linear-gradient(135deg, #6c5ce7, #a29bfe);
                color: white;
                border-radius: 10px 10px 0 0;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                color: white;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-body {
                padding: 20px;
            }
            .work-item {
                background-color: #f8f9fa;
                padding: 15px;
                margin-bottom: 15px;
                border-radius: 8px;
                border-left: 4px solid #6c5ce7;
            }
            .work-item h4 {
                color: #2d3436;
                margin-bottom: 8px;
            }
            .score {
                font-weight: bold;
                color: #00b894;
                margin-top: 10px;
            }
            .feedback-section {
                margin-bottom: 20px;
            }
            .feedback-section h4 {
                color: #2d3436;
                margin-bottom: 10px;
                font-size: 1.1em;
            }
            .feedback-section ul {
                padding-left: 20px;
            }
            .feedback-section li {
                margin-bottom: 8px;
                line-height: 1.5;
            }
        `;
        document.head.appendChild(style);
    }
    
    return modal;
}

// 모달 닫기 함수
function closeModal(button) {
    const modal = button.closest('.modal-overlay');
    modal.remove();
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('과학탐구실험 수행평가 1차 페이지가 로드되었습니다.');
    
    // 부드러운 스크롤 효과
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
