class Draggable {
  // 拖拽容器
  containerElement = null;
  // 拖拽元素，通过 firstIndex 记录 drag 的元素的开始位置下标，index 记录移动后的位置的下标。
  drag = { element: null, index: 0, firstIndex: 0};
  // 克隆出来的元素
  clone = { element: null, x: 0, y: 0 };
  // DOM元素节点，里面有所有元素的位置信息
  rectList = [];
  diff = { x: 0, y: 0 };
  lastPointerMove = { x: 0, y: 0 };
  referenceElement = null;
  // 按下的时候记录一个标记 isPointerDown，之后按下的状态才处理 pointermove 事件。
  isPointerDown = false;
        
  constructor(options) {
    this.containerElement = options.element;
    this.init();
  }
  init () {
    // 计算拖拽容器内元素的位置
    this.getRectList();
    // 绑定监听事件
    this.bindEventListener();
  }
  // 按下去的时候
  onPointerDown (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) {
      return;
    }
    if (e.target === this.containerElement) {
      return;
    }
    this.isPointerDown = true;
    // 不设置捕获，离开容器之后不会触发后续的up和move事件
    this.containerElement.setPointerCapture(e.pointerId);
    this.lastPointerMove.x = e.clientX;
    this.lastPointerMove.y = e.clientY;
    // 拖拽元素
    this.drag.element = e.target;
    this.drag.element.classList.add('active');
    // 克隆出来的元素
    this.clone.element = this.drag.element.cloneNode(true);
    document.body.appendChild(this.clone.element);
    // 元素下标
    const index = [].indexOf.call(this.containerElement.children, this.drag.element);
    this.drag.index = index;
    this.drag.firstIndex = index;
    // 赋值克隆元素的位置
    this.clone.x = this.rectList[index].left;
    this.clone.y = this.rectList[index].top;
    
    this.clone.element.style.transition = 'none';
    this.clone.element.className = 'clone-item';
    this.clone.element.style.transform = 'translate3d(' + this.clone.x + 'px, ' + this.clone.y + 'px, 0)';

    for (const item of this.containerElement.children) {
      item.style.transition = 'transform 500ms';
    }
  }
  onPointerMove (e) {
    if (this.isPointerDown) {

      this.diff.x = e.clientX - this.lastPointerMove.x;
      this.diff.y = e.clientY - this.lastPointerMove.y;
      this.lastPointerMove.x = e.clientX;
      this.lastPointerMove.y = e.clientY;
      // this.clone.x + this.diff.x < 255
      // 可以在这里限制边界

      this.clone.x += this.diff.x;
      this.clone.y += this.diff.y;
      this.clone.element.style.transform = 'translate3d(' + this.clone.x + 'px, ' + this.clone.y + 'px, 0)';
      // 碰撞逻辑
      for (let i = 0; i < this.rectList.length; i++) {
        if (i !== this.drag.index && e.clientX > this.rectList[i].left && e.clientX < this.rectList[i].right &&
          e.clientY > this.rectList[i].top && e.clientY < this.rectList[i].bottom) {
          // drag 的元素原来在前面，那就是这个区间内 firstIndex 之前的不动，之后的往前移
          if (this.drag.index < i) {
            for (let j = this.drag.index; j < i; j++) {
              if (j < this.drag.firstIndex) {
                this.containerElement.children[j].style.transform = 'translate3d(0px, 0px, 0)';
              } else {
                const x = this.rectList[j].left - this.rectList[j + 1].left;
                const y = this.rectList[j].top - this.rectList[j + 1].top;
                this.containerElement.children[j + 1].style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
              }
            }
            this.referenceElement = this.containerElement.children[i + 1];
          // 如果 drag 的元素原来在后面，那就是这个区间内的 firstIndex 之后的不动，之前的往后移
          } else if (this.drag.index > i) {
            for (let j = i; j < this.drag.index; j++) {
              if (this.drag.firstIndex <= j) {
                this.containerElement.children[j + 1].style.transform = 'translate3d(0px, 0px, 0)';
              } else {
                const x = this.rectList[j + 1].left - this.rectList[j].left;
                const y = this.rectList[j + 1].top - this.rectList[j].top;
                this.containerElement.children[j].style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
              }
            }
            this.referenceElement = this.containerElement.children[i];
          }
          // 移动拖拽元素自己
          const x = this.rectList[i].left - this.rectList[this.drag.firstIndex].left;
          const y = this.rectList[i].top - this.rectList[this.drag.firstIndex].top;
          this.drag.element.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
          this.drag.index = i;
          break;
        }
      }
    }
  }
  onPointerUp(e) {
    if (this.isPointerDown) {
      this.isPointerDown = false;
      // 插入元素
      if (this.referenceElement !== null) {
          this.containerElement.insertBefore(this.drag.element, this.referenceElement);
      }
      
      this.drag.element.classList.remove('active');
      this.clone.element.remove();

      for (const item of this.containerElement.children) {
          item.style.transition = 'none';
          item.style.transform = 'translate3d(0px, 0px, 0px)';
      }
    }
  }
  bindEventListener () {
    this.containerElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
    this.containerElement.addEventListener('pointermove', this.onPointerMove.bind(this));
    this.containerElement.addEventListener('pointerup', this.onPointerUp.bind(this));
    window.addEventListener('scroll', this.getRectList.bind(this));
    window.addEventListener('resize', this.getRectList.bind(this));
    window.addEventListener('orientationchange', this.getRectList.bind(this));
  }
  getRectList() {
    this.rectList.length = 0;
    for (const item of this.containerElement.children) {
        this.rectList.push(item.getBoundingClientRect());
    }
  }
}