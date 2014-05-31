class ArticleAnimator

  defaults:
    animationDuration: 500
    postCount: 5

  constructor: ($el, options) ->
    @options = $.extend {}, @defaults, options
    @$body = $ document.body
    @currentPostIndex = 1
    @load()

  load: ->
    @makeSelections()

    @$body.append @$current
    @$body.append @$next

    # create post
    @createPost type: 'current', =>
      @createPost type: 'next', ->
      # @refreshCrrentAndNextSelection()
      @bindGotoNextClick()
      # @bindPopstate()
      # @bindWindowScrall()

  # 最初に表示される２つの記事を作成
  makeSelections: ->
    @$page = $ '.page'
    @pageTemplate = @$page.clone().get(0).outerHTML
    @$current = @currentElementClone()
    @$next = @nextElementClone()

  getPost: (index, callback) ->
    $.getJSON './data/post_' + index + '.json', (d) ->
      callback d

  nextPostIndex: (index) ->
    if index is @options.postCount
      @currentPostIndex = 0
      return 1 
    else 
      return index + 1

  createPost: (opts, callback) ->
    # current or next article
    type = opts['type']

    # 二回目以降はここで新しいnextを作成
    if opts['fromTemplate']
      @currentPostIndex += 1
      @$body.append @nextElementClone()
      @['$' + type] = $ '.' + type

    # nextならindexを計算、currentならindexはそのまま
    index = if type is 'next' then @nextPostIndex @currentPostIndex else @currentPostIndex

    # Get post data from json
    @getPost index, (d) =>
      # Make article form target and this json data
      @contentizeElement @['$' + type], d

      # 一回目はcallbackがあるが、二回目以降はcallbackがない
      # callbackがあるときだけcallbackを実行する
      callback and callback()

  contentizeElement: ($el, d) ->
    # background image
    $el
      .find '.big-image'
      .css
        backgroundImage: 'url(' + d.image + ')'
    # title
    $el
      .find 'h1.title'
      .html d.title
    # description
    $el
      .find 'h2.description'
      .html d.title_secondary
    # content
    $el
      .find '.content .text'
      .html d.content
    # date
    $el
      .find 'h3.byline time'
      .html d.date
    # author
    $el
      .find 'h3.byline .author'
      .html d.author

  # main page animation
  animatePage: (callback) ->
    translationValue = @$next.get(0).getBoundingClientRect().top

    # current content fade out
    @$current.addClass 'fade-up-out'

    # next content upward
    @$next
      .removeClass 'content-hidden next'
      .addClass 'easing-upward'
      .css
        # gap top position but smooth
        'transform': 'translate3d(0, -' + translationValue + 'px, 0)'
        # much position but not smooth
        # 'transform': 'translate3d(0, 0, 0)'

    setTimeout =>
      @$body.scrollTop 0
      #  125行目でtransformを変更するときにアニメーションを無効にする
      @$next.removeClass 'easing-upward'
      @$current.remove()

      # next content position set
      @$next.css
        'transform': ''

      # change next to current
      @$current = @$next.addClass 'current'

      callback()

    , @options.animationDuration
  
  # nextにクリックイベントを追加
  bindGotoNextClick: ->
    @$next
      .find '.big-image'
      .on 'click', (e) =>
        e.preventDefault()

        # nextに付けたクリックイベントを削除
        $ @
          .unbind e

        @animatePage (=>
          @createPost {fromTemplate: true, type: 'next'}
          @bindGotoNextClick()
        )

  currentElementClone: ->
    @$page
      .clone()
      .removeClass 'hidden'
      .addClass 'current'

  nextElementClone: ->
    @$page
      .clone()
      .removeClass 'hidden'
      .addClass 'next content-hidden'


# jQuery plugin setting
$.fn.articleAnimator = (options) ->
  $el = $ @
  articleAnimator = new ArticleAnimator $el, options

# Document ready
$ ->
  $ 'body'
    .articleAnimator()
