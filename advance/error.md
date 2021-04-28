
# 错误处理

## 构造 error

在 go 语言中，有一个预定义的接口：`error`，该接口自带一个 `Error()` 方法，调用该方法会返回一个字符串。

```go
type error interface {
  Error() string
}
```

调用该方法，会返回当前错误的具体结果。一般有下面几种方式生成 error。

- `errors.New()`
- `fmt.Errorf()`

### errors.New()

调用 `errors.New()` 会返回一个 error 类型的结构体，该结构体内部会实现一个 `Error()` 方法， 调用该方法返回的结果为调用 `errors.New()` 方法时传入的内容。

```go
import (
	"errors"
	"fmt"
)

func divide(a, b int) (error, int) {
	if b == 0 {
    // 被除数为0，则构造一个 error 结构体
		return errors.New("被除数不能为0"), 0
	}
	var result = a / b
	return nil, result
}

func main() {
	var err error // error 类型数据的初始值为 nil，类似于 js 中的 null
	var result int

	err, result = divide(1, 0)

  if err == nil {
    // 如果 err 为 nil，说明运行正常
    fmt.Println("计算结果", result)
  } else {
    // 如果 err 不为 nil，说明运行出错
    // 调用 error 结构体的 Error 方法，输出错误原因
    fmt.Println("计算出错", err.Error())
  }
}
```

可以看到，上面的代码中，由于调用 `divide` 除法方法时，由于传入的被除数为 0。经过判断，会抛出一个由 `errors.New` 构造的 `error` 类型的结构体。

我们将调用 `error.Error()` 方法返回的结果输出到控制台，可以发现其返回的结果，就是传入 `New` 方法的值。

执行结果如下：

![](https://file.shenfq.com/pic/20210427164350.png)

### fmt.Errorf()

通过 `fmt.Errorf()` 方法构造的 error 结构体，与调用  `errors.New()` 方法的结果类似。不同的是，`fmt.Errorf()` 方法会进行一次数据的格式化。

```go
func divide(a, b int) (error, int) {
	if b == 0 {
    // 将参数进行一次格式化，格式化后的字符串放入 error 中
		return fmt.Errorf("数据 %d 不合法", b), 0
	}
	var result = a / b
	return nil, result
}

err, result := divide(1, 0)
fmt.Println("计算出错", err.Error())
```

执行结果如下：

![](https://file.shenfq.com/pic/20210427165114.png)

## panic() 与 recover()

### panic()

`panic()` 相当于主动停止程序运行，调用时 `panic()` 时，需要传入中断原因。调用后，会在控制台输出中断原因，以及中断时的调用堆栈。我们可以改造一下之前的代码：

```go
func divide(a, b int) (error, int) {
	if b == 0 {
    // 如果程序出错，直接停止运行
		panic("被除数不能为0")
	}
	var result = a / b
	return nil, result
}

func main() {
  err, result := divide(1, 0)
  fmt.Println("计算出错", err.Error())
}
```

在运行到 `panic()` 处，程序直接中断，并在控制台打印出了中断原因。

![](https://file.shenfq.com/pic/20210427174701.png)

`panic()` 可以理解为，js 程序中的 `throw new Error()` 的操作。那么，在 go 中有没有办法终止 `panic()` ，也就是类似于 `try-catch` 的操作，让程序回到正常的运行逻辑中呢？

### recover()

在介绍 `recover()` 方法之前，还需要介绍一个 go 语言中的另一个关键字：`defer`。

`defer` 后的语句会在函数进行 return 操作之前调用，常用于`资源释放`、`错误捕获`、`日志输出`。

```go
func getData(table, sql) {
  defer 中断连接()
  db := 建立连接(table)
  data := db.select(sql)
  return data
}
```

`defer` 后的语句会被存储在一个类似于栈的数据结构内，在函数结束的时候，被定义的语句按顺序出栈，越后面定义的语句越先被调用。

```go
func divide(a, b int) int {
  defer fmt.Println("除数为", b)
  defer fmt.Println("被除数为", a)

  result := a / b
  fmt.Println("计算结果为", result)
	return result
}

divide(10, 2)
```

上面的代码中，我们在函数开始运行的时候，先通过 `defer` 定义了两个输出语句，先输出`除数`，后输出`被除数`。 

![](https://file.shenfq.com/pic/20210428114124.png)

实际的运行结果是：

- 先输出计算结果；
- 然后输出被除数；
- 最后输出除数；

这和前面提到的，通过 `defer` 定义的语句会在函数结束的时候，按照出栈的方式进行执行，先定义的后执行。`defer` 除了会在函数结束的时候执行，出现异常的的时候也会先走 `defer` 的逻辑，也就是说，我们在调用了 `panic()` 方法后，程序中断过程中，也会先将 `defer` 内的语句运行一遍。

这里我们重新定义之前的 `divide` 函数，在执行之前加上一个 `defer` 语句，`defer` 后面为一个自执行函数，该函数内会调用 `recover()` 方法。

![](https://file.shenfq.com/pic/20210428120154.png)

`recover()` 方法调用后，会捕获到当前的 `panic()` 抛出的异常，并进行返回，如果没有异常，则返回 `nil`。

```go
func divide(a, b int) int {
  // 中断之前，调用 defer 后定义的语句
	defer func() {
		if err := recover(); err != nil {
			fmt.Println("捕获错误", err)
		}
	}()

	if b == 0 {
    // 函数运行被中断
		panic("被除数不能为0")
		return 0
	}

	return a / b
}

result := divide(1, 0)
fmt.Println("计算结果", result)
```

上面的代码运行后，我们发现之前调用 `panic()` 中断的程序被恢复了，而且后面的计算结果也正常进行输出了。 

![](https://file.shenfq.com/pic/20210428120544.png)

这就有点类似于 `try-catch` 的逻辑了，只是 `recover` 需要放在 `defer` 关键词后的语句中，更像是 `catch` 和 `finally` 的结合。 