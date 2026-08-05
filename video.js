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

    const indicadorLoading =
        conteudo.querySelector('#indicadorLoading')

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

    const indicadorSeek =
        conteudo.querySelector('#indicadorSeek')

    const iconeSeek =
        conteudo.querySelector('#iconeSeek')

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

    let timerSeek

    let timerVolume

    let timerLimpezaVolume

    let timerControles

    let mouseSobreControles = false

    let ultimoVolume = 1

    let seekEmAndamento = false

    let tempoSeekDesejado = null

    let frameSeek = null

    let timerLoadingSeek = null

    let timerRecuperacaoSeek = null

    let recuperandoSeek = false

    let tentativasRecuperacaoSeek = 0

    let reproduzirAposRecuperacao = false


    // ==========================================
    // DESATIVA MENU DE CONTEXTO
    // ==========================================

    video.oncontextmenu = () => false

    // ==========================================
    // INDICADOR DE CARREGAMENTO
    // ==========================================

    function mostrarLoading() {

        if (!indicadorLoading) return

        indicadorLoading.classList.add('mostrar')

    }


    // ==========================================
    // ESCONDER LOADING
    // ==========================================

    function esconderLoading() {

        if (!indicadorLoading) return

        clearTimeout(timerLoadingSeek)

        clearTimeout(timerRecuperacaoSeek)

        indicadorLoading.classList.remove('mostrar')

    }


    function mostrarLoadingSeek() {

        clearTimeout(timerLoadingSeek)

        timerLoadingSeek = setTimeout(() => {

            if (seekEmAndamento || video.seeking) {

                mostrarLoading()

            }

        }, 120)

    }


    function concluirSeek() {

        seekEmAndamento = false

        tempoSeekDesejado = null

        recuperandoSeek = false

        tentativasRecuperacaoSeek = 0

        esconderLoading()

    }


    function agendarRecuperacaoSeek() {

        clearTimeout(timerRecuperacaoSeek)

        if (
            !seekEmAndamento ||
            recuperandoSeek ||
            tentativasRecuperacaoSeek >= 1
        ) {

            return

        }


        timerRecuperacaoSeek = setTimeout(() => {

            const semDadosParaReproduzir =
                video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA


            if (
                !seekEmAndamento ||
                recuperandoSeek ||
                !semDadosParaReproduzir
            ) {

                return

            }


            recuperandoSeek = true

            tentativasRecuperacaoSeek++

            reproduzirAposRecuperacao = !video.paused

            video.load()

        }, 3000)

    }


    // ==========================================
    // VERIFICA SE O PONTO ESTÁ NO BUFFER
    // ==========================================



    // ==========================================
    // AGUARDA O PONTO DO SEEK CARREGAR
    // ==========================================



    // ==========================================
    // EVENTOS DE CARREGAMENTO
    // ==========================================

    video.addEventListener('waiting', () => {

        if (seekEmAndamento) {

            mostrarLoading()

            agendarRecuperacaoSeek()

        }

    })


    video.addEventListener('stalled', () => {

        if (seekEmAndamento) {

            mostrarLoading()

            agendarRecuperacaoSeek()

        }

    })


    video.addEventListener('seeking', () => {

        mostrarLoadingSeek()

        agendarRecuperacaoSeek()

    })


    video.addEventListener('seeked', () => {

        if (seekEmAndamento) {

            agendarRecuperacaoSeek()

        }

    })


    video.addEventListener('canplay', () => {

        // Se estiver pausado e não estiver mais
        // procurando um novo ponto, já está pronto.

        if (seekEmAndamento && !video.seeking) {

            concluirSeek()

        } else if (video.paused) {

            esconderLoading()

        }

    })


    video.addEventListener('playing', () => {

        // Quando realmente começar a reproduzir,
        // significa que o trecho solicitado está pronto.

        concluirSeek()

    })


    video.addEventListener('loadedmetadata', () => {

        if (!recuperandoSeek || tempoSeekDesejado === null) {

            return

        }


        video.currentTime = tempoSeekDesejado

        recuperandoSeek = false

        agendarRecuperacaoSeek()


        if (reproduzirAposRecuperacao) {

            video.play().catch(() => { })

        }

    })

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

        atualizarPosicaoIndicadorVolume()


        timerIndicador = setTimeout(() => {

            indicadorPlayPause.classList.remove('mostrar')

            indicadorPlayPause.classList.add('sumir')

            atualizarPosicaoIndicadorVolume()

        }, 450)


        setTimeout(() => {

            indicadorPlayPause.classList.remove('sumir')

        }, 750)

    }

    // ==========================================
    // INDICADOR DE AVANÇO / RETROCESSO
    // ==========================================

    function mostrarIndicadorSeek(direcao) {

        if (!indicadorSeek || !iconeSeek) return


        clearTimeout(timerSeek)


        // --------------------------------------
        // CONFIGURA ÍCONE
        // --------------------------------------

        if (direcao === 'direita') {

            iconeSeek.src = 'videos/right.png'

            iconeSeek.alt = 'Avançar 5 segundos'

        } else {

            iconeSeek.src = 'videos/left.png'

            iconeSeek.alt = 'Voltar 5 segundos'

        }


        // --------------------------------------
        // CONFIGURA POSIÇÃO
        // --------------------------------------

        indicadorSeek.classList.remove(
            'esquerda',
            'direita'
        )

        indicadorSeek.classList.add(direcao)


        // --------------------------------------
        // REINICIA ANIMAÇÃO
        // --------------------------------------

        indicadorSeek.classList.remove('sumir')

        indicadorSeek.classList.remove('mostrar')


        void indicadorSeek.offsetWidth


        indicadorSeek.classList.add('mostrar')


        // --------------------------------------
        // COMEÇA A SUMIR
        // --------------------------------------

        timerSeek = setTimeout(() => {

            indicadorSeek.classList.remove(
                'mostrar'
            )

            indicadorSeek.classList.add(
                'sumir'
            )

        }, 450)


        // --------------------------------------
        // LIMPA CLASSE
        // --------------------------------------

        setTimeout(() => {

            indicadorSeek.classList.remove(
                'sumir'
            )

        }, 750)

    }


    // ==========================================
    // INDICADOR DE VOLUME
    // ==========================================

    function atualizarPosicaoIndicadorVolume() {

        if (!indicadorVolume) return


        const playPauseVisivel =
            indicadorPlayPause &&
            indicadorPlayPause.classList.contains('mostrar')


        indicadorVolume.classList.toggle(
            'acima-pause',
            playPauseVisivel
        )

    }


    function mostrarIndicadorVolume() {

        if (!indicadorVolume) return


        // ==========================================
        // PORCENTAGEM
        // ==========================================

        const porcentagem =
            Math.round(video.volume * 100)


        if (volumePorcentagem) {

            volumePorcentagem.textContent =
                `${porcentagem}%`

        }


        // ==========================================
        // ÍCONE
        // ==========================================

        if (volumeIcone) {

            if (video.muted || porcentagem === 0) {

                volumeIcone.src =
                    'videos/volume-mute.png'

            } else if (porcentagem <= 50) {

                volumeIcone.src =
                    'videos/low-volume.png'

            } else {

                volumeIcone.src =
                    'videos/high-volume.png'

            }

        }


        // ==========================================
        // LIMPA ESTADOS ANTERIORES
        // ==========================================

        clearTimeout(timerVolume)

        clearTimeout(timerLimpezaVolume)

        indicadorVolume.classList.remove(
            'mostrar',
            'sumir'
        )


        // ==========================================
        // POSIÇÃO
        // ==========================================

        atualizarPosicaoIndicadorVolume()


        // ==========================================
        // REINICIA ANIMAÇÃO
        // ==========================================

        void indicadorVolume.offsetWidth


        // ==========================================
        // MOSTRA
        // ==========================================

        indicadorVolume.classList.add(
            'mostrar'
        )


        // ==========================================
        // DESAPARECE
        // ==========================================

        timerVolume = setTimeout(() => {

            indicadorVolume.classList.remove(
                'mostrar'
            )

            indicadorVolume.classList.add(
                'sumir'
            )

        }, 700)


        // ==========================================
        // LIMPA
        // ==========================================

        timerLimpezaVolume = setTimeout(() => {

            indicadorVolume.classList.remove(
                'sumir',
                'acima-pause'
            )

        }, 1000)

    }



    // ==========================================
    // PLAY / PAUSE
    // ==========================================


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

        mostrarControlesTemporariamente()

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

    function realizarSeek(direcao) {

        // ==========================================
        // VERIFICA DURAÇÃO
        // ==========================================

        if (
            !video.duration ||
            !isFinite(video.duration)
        ) {

            return false

        }


        let novoTempo

        const tempoBase =
            tempoSeekDesejado !== null
                ? tempoSeekDesejado
                : video.currentTime


        if (direcao === 'direita') {

            novoTempo =
                Math.min(
                    video.duration,
                    tempoBase + 5
                )

        } else {

            novoTempo =
                Math.max(
                    0,
                    tempoBase - 5
                )

        }


        // ==========================================
        // ACEITOU O SEEK
        // ==========================================

        seekEmAndamento = true

        tempoSeekDesejado = novoTempo

        recuperandoSeek = false

        tentativasRecuperacaoSeek = 0

        // ==========================================
        // MOSTRA LOADING SOMENTE SE DEMORAR
        // ==========================================

        mostrarLoadingSeek()


        // ==========================================
        // FAZ O SEEK MAIS RECENTE
        // ==========================================

        if (frameSeek) {

            cancelAnimationFrame(frameSeek)

        }


        frameSeek = requestAnimationFrame(() => {

            frameSeek = null

            video.currentTime = tempoSeekDesejado

            agendarRecuperacaoSeek()

        })

        return true

    }

    // ==========================================
    // TECLADO
    // ==========================================

    document.addEventListener('keydown', (e) => {

        const teclaSeek =
            e.key === 'ArrowLeft' ||
            e.key === 'ArrowRight'


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


        if (e.repeat && !teclaSeek) {

            return

        }


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


            const realizou =
                realizarSeek('esquerda')


            if (realizou) {

                mostrarIndicadorSeek('esquerda')

                mostrarControlesTemporariamente()

            }


            return

        }



        if (e.key === 'ArrowRight') {

            e.preventDefault()


            const realizou =
                realizarSeek('direita')


            if (realizou) {

                mostrarIndicadorSeek('direita')

                mostrarControlesTemporariamente()

            }


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
    // MOSTRAR CONTROLES TEMPORARIAMENTE
    // ==========================================

    function mostrarControlesTemporariamente() {

        if (document.fullscreenElement !== player) return

        controles.classList.remove(
            'controles-escondidos'
        )

        player.classList.remove(
            'cursor-escondido'
        )

        clearTimeout(timerControles)


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
                `<span>${Math.floor(percentual)}%</span>`

        }


        if (personagem) {

            personagem.style.left =
                `${percentual}% `

        }

    }


}
