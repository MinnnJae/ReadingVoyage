class ReadingChallenge {
    constructor() {
        this.year = new Date().getFullYear();
        this.target = 12; 
        this.booksRead = 0;
        this.init();
    }

    init() {
        this.loadChallenge();
        this.renderChallenge();
        this.setupEventListeners();
    }

    loadChallenge() {
        const saved = JSON.parse(localStorage.getItem('readingChallenge')) || {};
        this.target = saved.target || this.target;
        this.booksRead = saved.booksRead || this.booksRead;
    }

    saveChallenge() {
        localStorage.setItem('readingChallenge', JSON.stringify({
            target: this.target,
            booksRead: this.booksRead
        }));
    }

    renderChallenge() {
        const progress = (this.booksRead / this.target) * 100;
        
        document.getElementById('challengeProgress').style.width = `${progress}%`;
        document.getElementById('booksReadCount').textContent = this.booksRead;
        document.getElementById('targetCount').textContent = this.target;
        document.getElementById('progressText').textContent = `${Math.round(progress)}% Complete`;
    }

    setupEventListeners() {
        document.getElementById('updateChallenge').addEventListener('click', () => {
            this.updateChallenge();
        });
    }

    updateChallenge() {
        const newTarget = prompt('Set your reading goal for this year:', this.target);
        if (newTarget && !isNaN(newTarget)) {
            this.target = parseInt(newTarget);
            this.saveChallenge();
            this.renderChallenge();
        }
    }

    incrementBooksRead() {
        this.booksRead++;
        this.saveChallenge();
        this.renderChallenge();
    }
}

export default ReadingChallenge;