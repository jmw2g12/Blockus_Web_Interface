public class ServerInterface{
	int x = 420;
	public int getX(){
		return x;
	}
	public String getHiWorld(){
		return "Hello, World!";
	}
	public static void main(String[] args){
		System.out.println("in ServerInterface main");
	}
	public void printHiWorld(){
		System.out.println("Hello, World!");
	}
}
