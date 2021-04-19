module.exports = {
  title: 'Go 语言笔记',
  description: ' ',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['script', {}, `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?ce26c35c5c5403057ebddcb99965920a";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
    `]
  ],
  themeConfig: {
    search: true,
    lastUpdated: '最后更新时间',
    sidebar: [
      [
        '', '前言'
      ],
      {
        title: '基础',
        sidebarDepth: 2,
        children: [
          'basic/variable',
          'basic/modules',
          'basic/array',
          'basic/function',
          'basic/struct'
        ]
      },
      {
        title: '进阶',
        sidebarDepth: 2,
        children: [
          'advance/concurrent',
        ]
      },
      {
        title: '实战',
        sidebarDepth: 2,
        children: [
          'project/node_modeuls',
        ]
      }
    ]
  }
}
