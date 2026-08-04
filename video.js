// ==========================================
// ELEMENTOS
// ==========================================

const conteudo = document.getElementById('conteudo')

// ==========================================
// CARREGAR O PLAYER
// ==========================================

fetch('video.html')
    .then(resp => resp.text())
    .then(html => {


        conteudo.innerHTML = html

        inicializarVideo()

    })


// ==========================================
// FUNÇÃO PRINCIPAL DO PLAYER
// ==========================================

function inicializarVideo() {


    const video =
        conteudo.querySelector('#meuVideo')

    const player =
        conteudo.querySelector('.player')

    const controles =
        conteudo.querySelector('.controles-container')

    const personagem =
        conteudo.querySelector('#personagem')

    const indicadorPlayPause =
        conteudo.querySelector('#indicadorPlayPause')

    const indicadorVolume =
        conteudo.querySelector('#indicadorVolume')

    const volumeIcone =
        conteudo.querySelector('#volumeIcone')

    const volumePorcentagem =
        conteudo.querySelector('#volumePorcentagem')

    const btnPlay =
        conteudo.querySelector('[wm-play]')

    const btnFullscreen =
        conteudo.querySelector('[wm-fullscreen]')

    const progressoDiv =
        conteudo.querySelector('[wm-progresso] > div')


    if (!video) return


    // ==========================================
    // VARIÁVEIS
    // ==========================================

    let timerIndicador

    let timerVolume

    let timerControles

    let mouseSobreControles = false

    let ultimoVolume = 1


    // ==========================================
    // DESATIVA MENU DE CONTEXTO
    // ==========================================

    video.oncontextmenu = () => false


    // ==========================================
    // INDICADOR PLAY / PAUSE
    // ==========================================

    function mostrarIndicador(icone) {

        if (!indicadorPlayPause) return


        indicadorPlayPause.textContent = icone


        clearTimeout(timerIndicador)


        indicadorPlayPause.classList.remove('sumir')

        indicadorPlayPause.classList.remove('mostrar')


        // Força o navegador a reiniciar a animação
        void indicadorPlayPause.offsetWidth


        indicadorPlayPause.classList.add('mostrar')


        timerIndicador = setTimeout(() => {

            indicadorPlayPause.classList.remove('mostrar')

            indicadorPlayPause.classList.add('sumir')

        }, 450)


        setTimeout(() => {

            indicadorPlayPause.classList.remove('sumir')

        }, 750)

    }


    // ==========================================
    // INDICADOR DE VOLUME
    // ==========================================

    function mostrarIndicadorVolume() {

        if (!indicadorVolume) return


        const porcentagem =
            Math.round(video.volume * 100)


        // ------------------------------
        // PORCENTAGEM
        // ------------------------------

        if (volumePorcentagem) {

            volumePorcentagem.textContent =
                `${porcentagem}% `

        }


        // ------------------------------
        // ÍCONE
        // ------------------------------

        if (volumeIcone) {

            if (video.muted || porcentagem === 0) {

                volumeIcone.textContent = '🔇'

            } else if (porcentagem <= 50) {

                volumeIcone.textContent = '🔉'

            } else {

                volumeIcone.textContent = '🔊'

            }

        }


        // ------------------------------
        // ANIMAÇÃO
        // ------------------------------

        clearTimeout(timerVolume)


        indicadorVolume.classList.remove('sumir')

        indicadorVolume.classList.remove('mostrar')


        // Força reinício da animação
        void indicadorVolume.offsetWidth


        indicadorVolume.classList.add('mostrar')


        timerVolume = setTimeout(() => {

            indicadorVolume.classList.remove('mostrar')

            indicadorVolume.classList.add('sumir')

        }, 700)


        setTimeout(() => {

            indicadorVolume.classList.remove('sumir')

        }, 1000)

    }


    // ==========================================
    // PLAY / PAUSE
    // ==========================================

    function alternarPlayPause() {

        if (video.paused) {

            video.play()

            mostrarIndicador('▶')

        } else {

            video.pause()

            mostrarIndicador('❚❚')

        }

    }


    // ==========================================
    // BOTÃO PLAY
    // ==========================================

    if (btnPlay) {

        btnPlay.onclick = () => {

            alternarPlayPause()

        }

    }


    // ==========================================
    // CLIQUE NO VÍDEO
    // ==========================================

    video.onclick = () => {

        alternarPlayPause()

    }


    // ==========================================
    // PLAY
    // ==========================================

    video.onplay = () => {

        if (personagem) {

            personagem.src =
                'videos/andando.gif'

        }


        if (btnPlay) {

            btnPlay.textContent = '❚❚'

            btnPlay.title = 'Pause'

        }

    }


    // ==========================================
    // PAUSE
    // ==========================================

    video.onpause = () => {

        if (personagem) {

            personagem.src =
                'videos/parado.png'

        }


        if (btnPlay) {

            btnPlay.textContent = '▶'

            btnPlay.title = 'Play'

        }

    }


    // ==========================================
    // VÍDEO TERMINOU
    // ==========================================

    video.onended = () => {

        if (personagem) {

            personagem.src =
                'videos/parado.png'

        }


        if (btnPlay) {

            btnPlay.textContent = '▶'

            btnPlay.title = 'Play'

        }

    }


    // ==========================================
    // FULLSCREEN
    // ==========================================

    function alternarFullscreen() {

        if (!document.fullscreenElement) {

            player.requestFullscreen()

        } else {

            document.exitFullscreen()

        }

    }


    // ==========================================
    // BOTÃO FULLSCREEN
    // ==========================================

    if (btnFullscreen) {

        btnFullscreen.onclick = () => {

            alternarFullscreen()

        }

    }


    // ==========================================
    // DUPLO CLIQUE = FULLSCREEN
    // ==========================================

    video.ondblclick = () => {

        alternarFullscreen()

    }


    // ==========================================
    // VOLUME
    // ==========================================

    function definirVolume(novoVolume) {

        novoVolume =
            Math.max(0, Math.min(1, novoVolume))


        video.volume = novoVolume


        if (novoVolume > 0) {

            ultimoVolume = novoVolume

            video.muted = false

        }


        if (novoVolume === 0) {

            video.muted = true

        }


        mostrarIndicadorVolume()

    }


    // ==========================================
    // AUMENTAR VOLUME
    // ==========================================

    function aumentarVolume() {

        const novoVolume =
            video.volume + 0.05

        definirVolume(novoVolume)

    }


    // ==========================================
    // DIMINUIR VOLUME
    // ==========================================

    function diminuirVolume() {

        const novoVolume =
            video.volume - 0.05

        definirVolume(novoVolume)

    }


    // ==========================================
    // MUTE / DESMUTE
    // ==========================================

    function alternarMute() {

        if (video.muted || video.volume === 0) {

            video.muted = false

            video.volume =
                ultimoVolume > 0
                    ? ultimoVolume
                    : 1

        } else {

            ultimoVolume =
                video.volume

            video.muted = true

        }


        mostrarIndicadorVolume()

    }


    // ==========================================
    // TECLADO
    // ==========================================

    document.addEventListener('keydown', (e) => {

        if (e.repeat) return


        // --------------------------------------
        // NÃO INTERFERIR EM CAMPOS DE TEXTO
        // --------------------------------------

        const elemento =
            document.activeElement

        const digitando =
            elemento.tagName === 'INPUT' ||
            elemento.tagName === 'TEXTAREA' ||
            elemento.tagName === 'SELECT'


        if (digitando) return


        // --------------------------------------
        // K = PLAY / PAUSE
        // --------------------------------------

        if (e.key.toLowerCase() === 'k') {

            e.preventDefault()

            alternarPlayPause()

            return

        }


        // --------------------------------------
        // ESPAÇO = PLAY / PAUSE
        // --------------------------------------

        if (e.code === 'Space') {

            e.preventDefault()

            alternarPlayPause()

            return

        }


        // --------------------------------------
        // F = FULLSCREEN
        // --------------------------------------

        if (e.key.toLowerCase() === 'f') {

            e.preventDefault()

            alternarFullscreen()

            return

        }


        // --------------------------------------
        // M = MUTE
        // --------------------------------------

        if (e.key.toLowerCase() === 'm') {

            e.preventDefault()

            alternarMute()

            return

        }


        // --------------------------------------
        // ← = VOLTAR 5 SEGUNDOS
        // --------------------------------------

        if (e.key === 'ArrowLeft') {

            e.preventDefault()

            video.currentTime =
                Math.max(
                    0,
                    video.currentTime - 5
                )

            return

        }


        // --------------------------------------
        // → = AVANÇAR 5 SEGUNDOS
        // --------------------------------------

        if (e.key === 'ArrowRight') {

            e.preventDefault()

            video.currentTime =
                Math.min(
                    video.duration || Infinity,
                    video.currentTime + 5
                )

            return

        }


        // --------------------------------------
        // ↑ = AUMENTAR VOLUME
        // --------------------------------------

        if (e.key === 'ArrowUp') {

            e.preventDefault()

            aumentarVolume()

            return

        }


        // --------------------------------------
        // ↓ = DIMINUIR VOLUME
        // --------------------------------------

        if (e.key === 'ArrowDown') {

            e.preventDefault()

            diminuirVolume()

            return

        }

    })


    // ==========================================
    // CONTROLES + CURSOR
    // ==========================================

    function mostrarControles() {

        controles.classList.remove(
            'controles-escondidos'
        )

        player.classList.remove(
            'cursor-escondido'
        )


        clearTimeout(timerControles)


        if (document.fullscreenElement === player) {

            timerControles = setTimeout(() => {

                if (!mouseSobreControles) {

                    controles.classList.add(
                        'controles-escondidos'
                    )

                    player.classList.add(
                        'cursor-escondido'
                    )

                }

            }, 3000)

        }

    }


    // ==========================================
    // MOVIMENTO DO MOUSE
    // ==========================================

    player.addEventListener(
        'mousemove',
        () => {

            mostrarControles()

        }
    )


    // ==========================================
    // MOUSE NOS CONTROLES
    // ==========================================

    controles.addEventListener(
        'mouseenter',
        () => {

            mouseSobreControles = true

            clearTimeout(timerControles)

            controles.classList.remove(
                'controles-escondidos'
            )

        }
    )


    controles.addEventListener(
        'mouseleave',
        () => {

            mouseSobreControles = false

            mostrarControles()

        }
    )


    // ==========================================
    // FULLSCREEN CHANGE
    // ==========================================

    document.addEventListener(
        'fullscreenchange',
        () => {

            if (
                document.fullscreenElement === player
            ) {

                mostrarControles()

            } else {

                clearTimeout(timerControles)

                controles.classList.remove(
                    'controles-escondidos'
                )

                player.classList.remove(
                    'cursor-escondido'
                )

            }

        }
    )


    // ==========================================
    // BARRA DE PROGRESSO
    // ==========================================

    video.ontimeupdate = () => {

        if (!video.duration) return


        const percentual =
            (video.currentTime / video.duration) * 100


        if (progressoDiv) {

            progressoDiv.style.width =
                `${percentual}% `

            progressoDiv.innerHTML =
                `<span span > ${Math.floor(percentual)}%</span > `

        }


        if (personagem) {

            personagem.style.left =
                `${percentual}% `

        }

    }


}
