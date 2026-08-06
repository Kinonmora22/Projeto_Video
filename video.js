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

    const progresso =
        conteudo.querySelector('[wm-progresso]')

    const progressoDiv =
        conteudo.querySelector('[wm-progresso] > div')

    const controlesVolumeExternos =
        conteudo.querySelectorAll('[data-speaker-volume]')


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

    let barraVolumeAberta = null

    let arrastandoVolume = false

    let ultimoVolume = 1

    let seekEmAndamento = false

    let tempoSeekDesejado = null

    let frameSeek = null

    let timerLoadingSeek = null

    let timerRecuperacaoSeek = null

    let recuperandoSeek = false

    let tentativasRecuperacaoSeek = 0

    let reproduzirAposRecuperacao = false

    let reproduzirAposLoading = false

    let arrastandoProgresso = false

    let percentualProgressoArraste = 0


    const progressoBuffer =
        document.createElement('div')

    progressoBuffer.className = 'barra-buffer'

    if (progresso && progressoDiv) {

        progresso.insertBefore(
            progressoBuffer,
            progressoDiv
        )

    }


    function loadingVisivel() {

        return (
            indicadorLoading &&
            indicadorLoading.classList.contains('mostrar')
        )

    }


    function atualizarCentroVideoIndicadores() {

        if (!video || !player) return


        const limitesVideo =
            video.getBoundingClientRect()

        const limitesPlayer =
            player.getBoundingClientRect()

        const escalaIndicadores =
            document.fullscreenElement === player
                ? 1.2
                : Math.min(
                    1.2,
                    (limitesVideo.width / window.innerWidth) * 1.2,
                    (limitesVideo.height / window.innerHeight) * 1.2
                )


        player.style.setProperty(
            '--centro-video-x',
            `${limitesVideo.left - limitesPlayer.left + limitesVideo.width / 2}px`
        )

        player.style.setProperty(
            '--centro-video-y',
            `${limitesVideo.top - limitesPlayer.top + limitesVideo.height / 2}px`
        )

        player.style.setProperty(
            '--escala-indicadores',
            escalaIndicadores
        )

    }


    function esconderIndicadorPlayPauseImediatamente() {

        if (!indicadorPlayPause) return


        clearTimeout(timerIndicador)

        indicadorPlayPause.style.transition = 'none'

        indicadorPlayPause.classList.remove(
            'mostrar',
            'sumir'
        )

        void indicadorPlayPause.offsetWidth

        indicadorPlayPause.style.transition = ''

        atualizarPosicaoIndicadorVolume()

    }


    atualizarCentroVideoIndicadores()

    window.addEventListener(
        'resize',
        atualizarCentroVideoIndicadores
    )

    if ('ResizeObserver' in window) {

        const observerVideo =
            new ResizeObserver(atualizarCentroVideoIndicadores)

        observerVideo.observe(video)

    }


    function formatarTempo(segundos) {

        segundos =
            Math.max(0, Math.floor(segundos || 0))

        const horas =
            Math.floor(segundos / 3600)

        const minutos =
            Math.floor((segundos % 3600) / 60)

        const segundosRestantes =
            segundos % 60


        if (horas > 0) {

            return `${horas}:${String(minutos).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`

        }


        return `${String(minutos).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`

    }


    function obterPercentualProgressoPeloPonteiro(e) {

        if (!progresso) return 0


        const limites =
            progresso.getBoundingClientRect()

        const posicao =
            (e.clientX - limites.left) / limites.width


        return Math.max(
            0,
            Math.min(1, posicao)
        )

    }


    function atualizarVisualProgresso(percentual) {

        if (!video.duration) return


        const tempo =
            video.duration * percentual

        const tempoAtual =
            formatarTempo(tempo)

        const tempoTotal =
            formatarTempo(video.duration)


        if (progressoDiv) {

            progressoDiv.style.width =
                `${percentual * 100}% `

            progressoDiv.parentElement.dataset.tempoTotal =
                tempoTotal

            progressoDiv.innerHTML =
                `<span>${tempoAtual}</span>`

        }


        if (personagem) {

            personagem.style.left =
                `${percentual * 100}% `

        }

    }


    function atualizarBarraBuffer() {

        if (
            !progressoBuffer ||
            !video.duration ||
            !isFinite(video.duration)
        ) {

            return

        }


        let fimBuffer =
            0


        for (let i = 0; i < video.buffered.length; i++) {

            fimBuffer =
                Math.max(
                    fimBuffer,
                    video.buffered.end(i)
                )

        }


        progressoBuffer.style.width =
            `${Math.min(100, (fimBuffer / video.duration) * 100)}%`

    }


    // ==========================================
    // DESATIVA MENU DE CONTEXTO
    // ==========================================

    video.oncontextmenu = () => false

    // ==========================================
    // INDICADOR DE CARREGAMENTO
    // ==========================================

    function mostrarLoading() {

        if (!indicadorLoading) return

        esconderIndicadorPlayPauseImediatamente()

        if (!video.paused) {

            reproduzirAposLoading = true

        }


        if (personagem && (reproduzirAposLoading || !video.paused)) {

            personagem.src =
                'videos/parado.png'

        }

        indicadorLoading.classList.add('mostrar')

        atualizarPosicaoIndicadorVolume()

    }


    // ==========================================
    // ESCONDER LOADING
    // ==========================================

    function esconderLoading() {

        if (!indicadorLoading) return

        clearTimeout(timerLoadingSeek)

        clearTimeout(timerRecuperacaoSeek)

        indicadorLoading.classList.remove('mostrar')

        if (reproduzirAposLoading && video.paused) {

            video.play().catch(() => { })

        }

        if (personagem && (reproduzirAposLoading || !video.paused)) {

            personagem.src =
                'videos/andando.gif'

        }

        reproduzirAposLoading = false

        atualizarPosicaoIndicadorVolume()

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

            reproduzirAposRecuperacao =
                reproduzirAposLoading ||
                !video.paused

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

        atualizarCentroVideoIndicadores()

        atualizarBarraBuffer()

        if (progressoDiv) {

            progressoDiv.parentElement.dataset.tempoTotal =
                formatarTempo(video.duration)

        }

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


    video.addEventListener(
        'progress',
        atualizarBarraBuffer
    )


    video.addEventListener(
        'durationchange',
        atualizarBarraBuffer
    )


    video.addEventListener(
        'canplay',
        atualizarBarraBuffer
    )

    // ==========================================
    // INDICADOR PLAY / PAUSE
    // ==========================================

    function mostrarIndicador(icone) {

        if (!indicadorPlayPause) return

        if (loadingVisivel()) return


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

        const deveSubir =
            playPauseVisivel ||
            loadingVisivel()


        indicadorVolume.classList.toggle(
            'acima-pause',
            deveSubir
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
    // CONTROLE DE VOLUME EXTERNO
    // ==========================================

    function criarControleVolume() {

        controlesVolumeExternos.forEach((controle) => {

            const speaker =
                controle.querySelector('[data-volume-speaker]')

            const barra =
                controle.querySelector('[data-volume-barra]')


            if (!speaker || !barra) return


            speaker.addEventListener('click', (e) => {

                e.stopPropagation()


                if (barraVolumeAberta === controle) {

                    esconderBarraVolume()

                    return

                }


                mostrarBarraVolume(controle)

            })


            barra.addEventListener('click', (e) => {

                e.stopPropagation()

            })


            barra.addEventListener('pointerdown', (e) => {

                e.preventDefault()

                e.stopPropagation()

                arrastandoVolume = true

                barra.setPointerCapture(e.pointerId)

                atualizarVolumePeloPonteiro(e, controle)

            })


            barra.addEventListener('pointermove', (e) => {

                if (!arrastandoVolume) return

                atualizarVolumePeloPonteiro(e, controle)

            })


            barra.addEventListener('pointerup', () => {

                arrastandoVolume = false

            })


            barra.addEventListener('pointercancel', () => {

                arrastandoVolume = false

            })

        })


        document.addEventListener('click', (e) => {

            if (!barraVolumeAberta) return

            if (barraVolumeAberta.contains(e.target)) return

            esconderBarraVolume()

        })


        atualizarVisualBarraVolume()

        atualizarEstadoFullscreenVolumeExterno()

    }


    function mostrarBarraVolume(controle) {

        if (document.fullscreenElement === player) return


        if (
            barraVolumeAberta &&
            barraVolumeAberta !== controle
        ) {

            esconderBarraVolume(barraVolumeAberta)

        }


        barraVolumeAberta = controle

        controle.classList.add('volume-aberto')

        atualizarVisualBarraVolume()

    }


    function esconderBarraVolume(controle = barraVolumeAberta) {

        if (!controle) return


        controle.classList.remove('volume-aberto')


        if (barraVolumeAberta === controle) {

            barraVolumeAberta = null

        }


        arrastandoVolume = false

    }


    function atualizarVolumePeloPonteiro(e, controle) {

        const trilho =
            controle.querySelector('[data-volume-trilho]')

        if (!trilho) return


        const limites =
            trilho.getBoundingClientRect()

        const posicao =
            (e.clientY - limites.top) / limites.height

        const novoVolume =
            1 - posicao


        atualizarVolume(novoVolume, false)

    }


    function atualizarVisualBarraVolume() {

        const volumeAtual =
            video.muted
                ? 0
                : video.volume

        const porcentagem =
            `${volumeAtual * 100}%`


        controlesVolumeExternos.forEach((controle) => {

            const preenchimento =
                controle.querySelector('[data-volume-preenchimento]')

            const thumb =
                controle.querySelector('[data-volume-thumb]')


            if (preenchimento) {

                preenchimento.style.height = porcentagem

            }


            if (thumb) {

                thumb.style.bottom = porcentagem

            }

        })

    }


    function atualizarEstadoFullscreenVolumeExterno() {

        const emFullscreen =
            document.fullscreenElement === player


        document.body.classList.toggle(
            'volume-externo-escondido',
            emFullscreen
        )


        if (emFullscreen) {

            esconderBarraVolume()

        }

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

    function atualizarVolume(novoVolume, exibirIndicador = true) {

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


        atualizarVisualBarraVolume()


        if (exibirIndicador) {

            mostrarIndicadorVolume()

        }

    }


    function definirVolume(novoVolume) {

        atualizarVolume(novoVolume)

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


        atualizarVisualBarraVolume()

        mostrarIndicadorVolume()

    }


    criarControleVolume()

    function realizarSeekParaTempo(novoTempo) {

        if (
            !video.duration ||
            !isFinite(video.duration)
        ) {

            return false

        }


        novoTempo =
            Math.max(
                0,
                Math.min(video.duration, novoTempo)
            )


        // ==========================================
        // ACEITOU O SEEK
        // ==========================================

        seekEmAndamento = true

        reproduzirAposLoading =
            reproduzirAposLoading ||
            !video.paused

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


        return realizarSeekParaTempo(novoTempo)

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
        // 0-9 = IR PARA PORCENTAGEM DO VIDEO
        // --------------------------------------

        if (/^[0-9]$/.test(e.key)) {

            e.preventDefault()

            const percentual =
                Number(e.key) / 10

            const realizou =
                realizarSeekParaTempo(video.duration * percentual)


            if (realizou) {

                mostrarControlesTemporariamente()

            }


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


    if (progresso) {

        progresso.addEventListener('pointerdown', (e) => {

            if (
                e.button !== undefined &&
                e.button !== 0
            ) {

                return

            }


            if (!video.duration) return


            e.preventDefault()

            arrastandoProgresso = true

            if (personagem) {

                personagem.src =
                    'videos/parado.png'

            }

            progresso.setPointerCapture(e.pointerId)

            percentualProgressoArraste =
                obterPercentualProgressoPeloPonteiro(e)

            atualizarVisualProgresso(
                percentualProgressoArraste
            )

            mostrarControlesTemporariamente()

        })


        progresso.addEventListener('pointermove', (e) => {

            if (!arrastandoProgresso) return


            percentualProgressoArraste =
                obterPercentualProgressoPeloPonteiro(e)

            atualizarVisualProgresso(
                percentualProgressoArraste
            )

        })


        progresso.addEventListener('pointerup', (e) => {

            if (!arrastandoProgresso) return


            arrastandoProgresso = false

            if (personagem) {

                personagem.src =
                    video.paused
                        ? 'videos/parado.png'
                        : 'videos/andando.gif'

            }

            percentualProgressoArraste =
                obterPercentualProgressoPeloPonteiro(e)

            atualizarVisualProgresso(
                percentualProgressoArraste
            )

            realizarSeekParaTempo(
                video.duration * percentualProgressoArraste
            )

            mostrarControlesTemporariamente()

        })


        progresso.addEventListener('pointercancel', () => {

            arrastandoProgresso = false

            if (personagem) {

                personagem.src =
                    video.paused
                        ? 'videos/parado.png'
                        : 'videos/andando.gif'

            }

        })

    }


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

            requestAnimationFrame(
                atualizarCentroVideoIndicadores
            )

            atualizarEstadoFullscreenVolumeExterno()


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

        atualizarBarraBuffer()

        if (arrastandoProgresso) return


        const percentual =
            (video.currentTime / video.duration) * 100

        atualizarVisualProgresso(percentual / 100)

    }


}
