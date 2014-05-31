(function() {
  var ArticleAnimator;

  ArticleAnimator = (function() {
    ArticleAnimator.prototype.defaults = {
      animationDuration: 500,
      postCount: 5
    };

    function ArticleAnimator($el, options) {
      this.options = $.extend({}, this.defaults, options);
      this.$body = $(document.body);
      this.currentPostIndex = 1;
      this.load();
    }

    ArticleAnimator.prototype.load = function() {
      this.makeSelections();
      this.$body.append(this.$current);
      this.$body.append(this.$next);
      return this.createPost({
        type: 'current'
      }, (function(_this) {
        return function() {
          _this.createPost({
            type: 'next'
          }, function() {});
          return _this.bindGotoNextClick();
        };
      })(this));
    };

    ArticleAnimator.prototype.makeSelections = function() {
      this.$page = $('.page');
      this.pageTemplate = this.$page.clone().get(0).outerHTML;
      this.$current = this.currentElementClone();
      return this.$next = this.nextElementClone();
    };

    ArticleAnimator.prototype.getPost = function(index, callback) {
      return $.getJSON('./data/post_' + index + '.json', function(d) {
        return callback(d);
      });
    };

    ArticleAnimator.prototype.nextPostIndex = function(index) {
      if (index === this.options.postCount) {
        this.currentPostIndex = 0;
        return 1;
      } else {
        return index + 1;
      }
    };

    ArticleAnimator.prototype.createPost = function(opts, callback) {
      var index, type;
      type = opts['type'];
      if (opts['fromTemplate']) {
        this.currentPostIndex += 1;
        this.$body.append(this.nextElementClone());
        this['$' + type] = $('.' + type);
      }
      index = type === 'next' ? this.nextPostIndex(this.currentPostIndex) : this.currentPostIndex;
      return this.getPost(index, (function(_this) {
        return function(d) {
          _this.contentizeElement(_this['$' + type], d);
          return callback && callback();
        };
      })(this));
    };

    ArticleAnimator.prototype.contentizeElement = function($el, d) {
      $el.find('.big-image').css({
        backgroundImage: 'url(' + d.image + ')'
      });
      $el.find('h1.title').html(d.title);
      $el.find('h2.description').html(d.title_secondary);
      $el.find('.content .text').html(d.content);
      $el.find('h3.byline time').html(d.date);
      return $el.find('h3.byline .author').html(d.author);
    };

    ArticleAnimator.prototype.animatePage = function(callback) {
      var translationValue;
      translationValue = this.$next.get(0).getBoundingClientRect().top;
      this.$current.addClass('fade-up-out');
      this.$next.removeClass('content-hidden next').addClass('easing-upward').css({
        'transform': 'translate3d(0, -' + translationValue + 'px, 0)'
      });
      return setTimeout((function(_this) {
        return function() {
          _this.$body.scrollTop(0);
          _this.$next.removeClass('easing-upward');
          _this.$current.remove();
          _this.$next.css({
            'transform': ''
          });
          _this.$current = _this.$next.addClass('current');
          return callback();
        };
      })(this), this.options.animationDuration);
    };

    ArticleAnimator.prototype.bindGotoNextClick = function() {
      return this.$next.find('.big-image').on('click', (function(_this) {
        return function(e) {
          e.preventDefault();
          $(_this).unbind(e);
          return _this.animatePage((function() {
            _this.createPost({
              fromTemplate: true,
              type: 'next'
            });
            return _this.bindGotoNextClick();
          }));
        };
      })(this));
    };

    ArticleAnimator.prototype.currentElementClone = function() {
      return this.$page.clone().removeClass('hidden').addClass('current');
    };

    ArticleAnimator.prototype.nextElementClone = function() {
      return this.$page.clone().removeClass('hidden').addClass('next content-hidden');
    };

    return ArticleAnimator;

  })();

  $.fn.articleAnimator = function(options) {
    var $el, articleAnimator;
    $el = $(this);
    return articleAnimator = new ArticleAnimator($el, options);
  };

  $(function() {
    return $('body').articleAnimator();
  });

}).call(this);
