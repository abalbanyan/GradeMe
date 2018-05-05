env: clean-env
	tar -czvf env.tar.gz -C env .

sample sample-bad: clean-submission
	tar -czvf submission.tar.gz -C $@ .

clean-%:
	rm $*.tar.gz 2> /dev/null || true

clean: clean-env clean-submission
	
.PHONY: env sample sample-bad clean-% clean
